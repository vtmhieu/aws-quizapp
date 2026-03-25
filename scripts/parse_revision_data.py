import json
import re
import os

KEYWORDS_FILE = 'vntechies-aws-saa-c03/M-keywords-mapping.md'
COMPARISONS_FILE = 'vntechies-aws-saa-c03/14-so-sanh-services.md'
OUTPUT_FILE = 'src/data/revision_data.json'

def parse_markdown_table(lines, start_idx):
    headers = []
    rows = []
    
    # Parse header
    header_line = lines[start_idx].strip()
    headers = [col.strip().replace('**', '') for col in header_line.split('|')[1:-1]]
    
    # Skip separator line
    idx = start_idx + 2
    
    # Parse rows
    while idx < len(lines) and lines[idx].strip().startswith('|'):
        row_cols = [col.strip().replace('**', '').replace('"', '') for col in lines[idx].split('|')[1:-1]]
        row_dict = {}
        for i, header in enumerate(headers):
            if i < len(row_cols):
                row_dict[header] = row_cols[i]
        rows.append(row_dict)
        idx += 1
        
    return rows, idx

def parse_keywords():
    with open(KEYWORDS_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    categories = []
    current_category = None
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## '):
            if current_category:
                categories.append(current_category)
            if 'Checklist' in line or 'Exam Strategy' in line:
                current_category = None
            else:
                cat_name = line.replace('##', '').strip()
                current_category = {'category': cat_name, 'keywords': []}
        elif line.startswith('|') and 'Keyword' in line and current_category:
            rows, i = parse_markdown_table(lines, i)
            current_category['keywords'].extend(rows)
            continue
        i += 1
        
    if current_category:
        categories.append(current_category)
        
    return categories

def parse_comparisons():
    with open(COMPARISONS_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    comparisons = []
    current_heading = None
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('### '):
            current_heading = line.replace('###', '').strip()
        elif line.startswith('|') and 'Feature' in line and current_heading:
            rows, i = parse_markdown_table(lines, i)
            # Find the header line to see elements being compared
            header_line = lines[i-len(rows)-2].strip()
            headers = [col.strip().replace('**', '') for col in header_line.split('|')[1:-1]]
            services = headers[1:] if len(headers) > 1 else []
            
            comparisons.append({
                'title': current_heading,
                'services': services,
                'features': rows
            })
            continue
        i += 1
        
    return comparisons

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    revision_data = {
        'keywords': parse_keywords(),
        'comparisons': parse_comparisons()
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(revision_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
