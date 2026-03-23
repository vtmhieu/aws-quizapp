import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  isMultiSelect: boolean;
}

function parseQuestions(filePath: string): Question[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const questions: Question[] = [];

  // Regex to match question starts like "1]", "2]", "51.", "IMP>>>124."
  const questionStartRe = /^(?:IMP[>\s]*)?(\d+)\]\s*(.*)/;
  // Also match forms like "51.A company..." 
  const questionStartRe2 = /^(?:IMP[>\s]*)?(\d+)\.\s*(.*)/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    let qMatch = line.match(questionStartRe) || line.match(questionStartRe2);
    if (!qMatch) {
      i++;
      continue;
    }

    const id = parseInt(qMatch[1], 10);
    let questionText = qMatch[2].trim();
    i++;

    // Collect additional question lines
    while (i < lines.length) {
      const nextLine = lines[i].trim();
      if (nextLine.length === 0) { i++; break; }
      // Stop if we hit a separator or answer marker
      if (nextLine.match(/^-{5,}/) || nextLine.match(/^\*{5,}/)) break;
      // Stop if next question starts
      if (nextLine.match(/^(?:IMP[>\s]*)?\d+[.\]]\s/)) break;
      // Stop if it looks like an answer
      if (nextLine.startsWith('ans-') || nextLine.startsWith('ans -') || nextLine.match(/^Answer:\s/)) break;
      questionText += ' ' + nextLine;
      i++;
    }

    // Find the answer - scan forward until we find it or hit separator
    let answerText = '';
    let explanationText = '';
    let foundAnswer = false;

    while (i < lines.length) {
      const nextLine = lines[i].trim();
      
      // Hit separator or next question - done with this block
      if (nextLine.match(/^-{5,}/) || nextLine.match(/^\*{5,}/)) {
        i++;
        break;
      }
      if (nextLine.match(/^(?:IMP[>\s]*)?\d+[.\]]\s/) && !foundAnswer) {
        break;
      }
      if (nextLine.match(/^(?:IMP[>\s]*)?\d+[.\]]\s/) && foundAnswer) {
        break;
      }

      if (!foundAnswer) {
        // Look for answer patterns
        if (nextLine.startsWith('ans-') || nextLine.startsWith('ans -')) {
          answerText = nextLine.replace(/^ans\s*-\s*/, '').trim();
          foundAnswer = true;
          i++;
          continue;
        }
        if (nextLine.match(/^Answers?:\s/)) {
          answerText = nextLine.replace(/^Answers?:\s*/, '').trim();
          foundAnswer = true;
          i++;
          continue;
        }
        if (nextLine.match(/^Answer:\s/)) {
          answerText = nextLine.replace(/^Answer:\s*/, '').trim();
          foundAnswer = true;
          i++;
          continue;
        }
        // Single letter answer like "A. Create..." or "B. Use..."
        if (nextLine.match(/^[A-E][.)]\s/)) {
          answerText = nextLine.trim();
          foundAnswer = true;
          i++;
          // Check for additional answer lines (multi-select)
          while (i < lines.length) {
            const nl = lines[i].trim();
            if (nl.match(/^[A-E][.)]\s/)) {
              answerText += '\n' + nl;
              i++;
            } else {
              break;
            }
          }
          continue;
        }
        // Skip empty or irrelevant lines before answer
        i++;
      } else {
        // Collecting explanation
        if (nextLine.length > 0) {
          explanationText += (explanationText ? ' ' : '') + nextLine;
        }
        i++;
      }
    }

    // Skip any remaining separators
    while (i < lines.length && (lines[i].trim().match(/^-{5,}/) || lines[i].trim().match(/^\*{5,}/) || lines[i].trim().length === 0)) {
      i++;
    }

    const isMultiSelect = /choose\s+(two|three|2|3)/i.test(questionText);

    if (questionText.length > 10 && answerText.length > 0) {
      questions.push({
        id,
        question: questionText.trim(),
        answer: answerText.trim(),
        explanation: explanationText.trim(),
        isMultiSelect,
      });
    }
  }

  return questions;
}

// Run parser
const resourcePath = path.resolve(__dirname, '../resources/AWS SAA-03 Solution.txt');
const outputPath = path.resolve(__dirname, '../src/data/questions.json');

console.log('Parsing questions from:', resourcePath);
const questions = parseQuestions(resourcePath);
console.log(`Parsed ${questions.length} questions`);

// Write output
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log('Written to:', outputPath);

// Quick validation
if (questions.length > 0) {
  console.log('\nFirst 3 questions:');
  questions.slice(0, 3).forEach(q => {
    console.log(`  #${q.id}: ${q.question.substring(0, 80)}...`);
    console.log(`  Answer: ${q.answer.substring(0, 80)}...`);
    console.log();
  });
  console.log(`Last question: #${questions[questions.length - 1].id}`);
}
