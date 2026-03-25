import json
import re
import os

EXAM_FILE = 'vntechies-aws-saa-c03/S-practice-exam.md'
OUTPUT_FILE = 'src/data/practice_exam_vn.json'

def parse_exam():
    with open(EXAM_FILE, 'r', encoding='utf-8') as f:
        text = f.read()

    # The file has a structure:
    # ### Câu 1
    # <question text>
    # **A.** <option A>
    # **B.** <option B>
    # ...
    #
    # Then later in the file it has answers, but wait, the view_file didn't show the answers. Let's look for answers.
    # We might need to handle answers if they exist, or just parse questions and we can manually check or fetch more.
    
    # Split by ### Câu
    parts = re.split(r'### Câu \d+', text)
    
    questions = []
    
    for i, part in enumerate(parts[1:], 1):
        lines = [line.strip() for line in part.strip().split('\n') if line.strip()]
        
        question_text = []
        options = []
        
        for line in lines:
            if line.startswith('**A.**') or line.startswith('**B.**') or line.startswith('**C.**') or line.startswith('**D.**') or line.startswith('**E.**') or line.startswith('**F.**'):
                match = re.match(r'\*\*([A-F])\.\*\*\s*(.*)', line)
                if match:
                    options.append(f"{match.group(1)}. {match.group(2)}")
            elif not line.startswith('---') and not line.startswith('##'):
                question_text.append(line)
        
        q_text = '\n'.join(question_text).strip()
        
        if q_text and options:
            questions.append({
                'id': f"vn-practice-{i}",
                'question': q_text,
                'options': options,
                'explanation': '',
                'answer': '' # We need the answer key
            })
            
    return questions

def parse_answers(questions):
    with open(EXAM_FILE, 'r', encoding='utf-8') as f:
        text = f.read()
        
    # Look for the answer key section
    answer_section = text.find('## ĐÁP ÁN VÀ GIẢI THÍCH')
    if answer_section != -1:
        ans_text = text[answer_section:]
        # Format might be ### Câu 1: B
        ans_matches = re.finditer(r'### Câu (\d+)[:.\s]*\*\*([A-F,\s]+)\*\*', ans_text)
        for match in ans_matches:
            q_idx = int(match.group(1)) - 1
            ans = match.group(2).strip()
            if 0 <= q_idx < len(questions):
                questions[q_idx]['answer'] = ans
                
        # Also let's try another format if the first fails:
        # **Câu 1:** A
        ans_matches_2 = re.finditer(r'\*\*Câu (\d+)[:.\s]*\*\*([A-F,\s]+)', ans_text)
        for match in ans_matches_2:
            q_idx = int(match.group(1)) - 1
            ans = match.group(2).strip()
            if 0 <= q_idx < len(questions):
                questions[q_idx]['answer'] = ans
    return questions

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    questions = parse_exam()
    # Try parsing answers
    questions = parse_answers(questions)
    
    # Save as JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {OUTPUT_FILE} with {len(questions)} questions.")

if __name__ == '__main__':
    main()
