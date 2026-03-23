"""
Parse the PDF for structured choices (A, B, C, D, E) and merge with
the answer/explanation data from the text file. Outputs questions.json.
"""
import pdfplumber
import re
import json
import sys
import os

PDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'resources', 'AWS Certified Solutions Architect Associate SAA-C03.pdf')
TXT_PATH = os.path.join(os.path.dirname(__file__), '..', 'resources', 'AWS SAA-03 Solution.txt')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'questions.json')

def extract_pdf_text(path):
    pdf = pdfplumber.open(path)
    text = ""
    for page in pdf.pages:
        t = page.extract_text()
        if t:
            text += t + "\n"
    pdf.close()
    return text

def parse_pdf_questions(text):
    """Parse questions from PDF text, extracting question text and choices."""
    # Split by question markers: "Question #N Topic N"
    pattern = r'Question #(\d+)\s+Topic \d+'
    splits = re.split(pattern, text)
    
    questions = {}
    # splits: [preamble, id1, body1, id2, body2, ...]
    for i in range(1, len(splits) - 1, 2):
        qid = int(splits[i])
        body = splits[i + 1].strip()
        
        # Extract choices: lines starting with A. B. C. D. E.
        # Find the first choice to split question from choices
        choice_pattern = r'\n([A-E])\.\s'
        choice_matches = list(re.finditer(choice_pattern, '\n' + body))
        
        if not choice_matches:
            # No choices found, skip
            continue
        
        # Question text is everything before the first choice
        first_choice_pos = choice_matches[0].start()
        # Adjust for the prepended \n
        question_text = body[:first_choice_pos].strip()
        choices_text = body[first_choice_pos:].strip()
        
        # Parse individual choices
        choices = {}
        for j, m in enumerate(choice_matches):
            letter = m.group(1)
            start = m.start()
            if j + 1 < len(choice_matches):
                end = choice_matches[j + 1].start()
            else:
                end = len('\n' + body)
            
            choice_body = ('\n' + body)[start:end].strip()
            # Remove the "A. " prefix
            choice_body = re.sub(r'^[A-E]\.\s*', '', choice_body).strip()
            # Clean up multi-line choices
            choice_body = ' '.join(choice_body.split())
            choices[letter] = choice_body
        
        questions[qid] = {
            'question': ' '.join(question_text.split()),
            'choices': choices
        }
    
    return questions

def parse_txt_answers(path):
    """Parse the text file for correct answers and explanations."""
    with open(path, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    answers = {}
    
    # Pattern to match question start
    q_re = re.compile(r'^(?:IMP[>\s]*)?(\d+)[.\]]\s*(.*)', re.IGNORECASE)
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = q_re.match(line)
        if not m:
            i += 1
            continue
        
        qid = int(m.group(1))
        i += 1
        
        # Skip to find answer
        answer_text = ''
        explanation_text = ''
        found_answer = False
        
        while i < len(lines):
            nl = lines[i].strip()
            if re.match(r'^-{5,}', nl) or re.match(r'^\*{5,}', nl):
                i += 1
                break
            if q_re.match(nl):
                break
            
            if not found_answer:
                # Look for answer patterns
                if nl.startswith('ans-') or nl.startswith('ans -'):
                    answer_text = re.sub(r'^ans\s*-\s*', '', nl).strip()
                    found_answer = True
                    i += 1
                    continue
                if re.match(r'^Answers?:\s', nl):
                    answer_text = re.sub(r'^Answers?:\s*', '', nl).strip()
                    found_answer = True
                    i += 1
                    continue
                if re.match(r'^Answer:\s', nl):
                    answer_text = re.sub(r'^Answer:\s*', '', nl).strip()
                    found_answer = True
                    i += 1
                    continue
                # Single/multi letter answer
                if re.match(r'^[A-E][.)]\s', nl):
                    answer_text = nl.strip()
                    found_answer = True
                    i += 1
                    # Collect additional answer lines for multi-select
                    while i < len(lines):
                        nl2 = lines[i].strip()
                        if re.match(r'^[A-E][.)]\s', nl2):
                            answer_text += '\n' + nl2
                            i += 1
                        else:
                            break
                    continue
                i += 1
            else:
                # Collecting explanation 
                if nl:
                    explanation_text += (' ' if explanation_text else '') + nl
                i += 1
        
        if answer_text:
            # Extract correct letter(s) from answer
            correct_letters = re.findall(r'\b([A-E])[.)]\s', answer_text)
            if not correct_letters:
                # Try to find letter at start
                letter_match = re.match(r'^\.?\s*([A-E])\b', answer_text)
                if letter_match:
                    correct_letters = [letter_match.group(1)]
            
            answers[qid] = {
                'answer_text': answer_text,
                'explanation': explanation_text,
                'correct_letters': correct_letters
            }
    
    return answers

def merge_and_output(pdf_questions, txt_answers, out_path):
    """Merge PDF choices with text answers and output JSON."""
    result = []
    
    for qid in sorted(pdf_questions.keys()):
        pq = pdf_questions[qid]
        ta = txt_answers.get(qid, {})
        
        correct_letters = ta.get('correct_letters', [])
        
        # If we didn't get correct letters from parsing, try to find from answer text
        if not correct_letters and ta.get('answer_text'):
            ans = ta['answer_text']
            for letter in ['A', 'B', 'C', 'D', 'E']:
                if letter in pq.get('choices', {}) and pq['choices'][letter][:40] in ans:
                    correct_letters.append(letter)
        
        choices = []
        for letter in ['A', 'B', 'C', 'D', 'E']:
            if letter in pq.get('choices', {}):
                choices.append({
                    'letter': letter,
                    'text': pq['choices'][letter],
                    'isCorrect': letter in correct_letters
                })
        
        is_multi = len(correct_letters) > 1 or 'choose two' in pq['question'].lower() or 'choose three' in pq['question'].lower()
        
        result.append({
            'id': qid,
            'question': pq['question'],
            'choices': choices,
            'correctLetters': correct_letters,
            'explanation': ta.get('explanation', ''),
            'answerText': ta.get('answer_text', ''),
            'isMultiSelect': is_multi
        })
    
    with open(out_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    return result

# Run
print("Extracting PDF text...")
pdf_text = extract_pdf_text(PDF_PATH)
print(f"PDF text: {len(pdf_text)} chars")

print("Parsing PDF questions...")
pdf_questions = parse_pdf_questions(pdf_text)
print(f"PDF questions: {len(pdf_questions)}")

print("Parsing text answers...")
txt_answers = parse_txt_answers(TXT_PATH)
print(f"Text answers: {len(txt_answers)}")

print("Merging...")
result = merge_and_output(pdf_questions, txt_answers, OUT_PATH)
print(f"Output: {len(result)} questions written to {OUT_PATH}")

# Stats
with_choices = sum(1 for q in result if q['choices'])
with_correct = sum(1 for q in result if q['correctLetters'])
multi = sum(1 for q in result if q['isMultiSelect'])
print(f"\nStats:")
print(f"  With choices: {with_choices}")
print(f"  With correct answer identified: {with_correct}")
print(f"  Multi-select: {multi}")

# Sample
if result:
    q = result[0]
    print(f"\nSample Q#{q['id']}:")
    print(f"  Q: {q['question'][:80]}...")
    for c in q['choices']:
        mark = '✓' if c['isCorrect'] else ' '
        print(f"  [{mark}] {c['letter']}. {c['text'][:60]}...")
