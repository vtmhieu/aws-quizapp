import os
import re
import json
import glob

REPO_DIR = 'vntechies-aws-saa-c03'
OUTPUT_FILE = 'src/data/services_glossary.json'

def parse_files():
    # Only files 01 to 13 contains the services breakdown
    files = glob.glob(os.path.join(REPO_DIR, '[0-1][0-9]-*.md'))
    files = sorted(files)
    
    glossary = []
    
    for file_path in files:
        if "14-" in file_path or "00-" in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract group name from H1
        h1_match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
        group_name = "Other"
        if h1_match:
            group_raw = h1_match.group(1).strip()
            # Clean up emojis and " - AWS SAA-C03" suffix
            group_name = re.sub(r'[^\w\s-]', '', group_raw).replace('AWS SAA-C03', '').strip()
            
        # Services usually start with ## 1️⃣ AMAZON EC2 (Elastic Compute Cloud)
        # Regex to capture: ## [Number][Emoji] Service Name [(Stands For)]
        # We look for lines starting with ## followed by numbers/emojis and capturing the text until newline
        
        # Split by ##
        sections = re.split(r'^##\s+', content, flags=re.MULTILINE)[1:] # Skip first section (usually overview)
        
        for section in sections:
            lines = section.split('\n')
            header = lines[0].strip()
            
            # Check if this header looks like a service (e.g. "1️⃣ AMAZON EC2 (Elastic Compute Cloud)" or "AWS LAMBDA")
            # We want to exclude generic headers like "📌 Tổng Quan" or "📋 COMPUTE SERVICES COMPARISON"
            if "Tổng Quan" in header or "COMPARISON" in header or "SCENARIOS" in header or "MISTAKES" in header or "TIPS" in header or "CHECKLIST" in header:
                continue
                
            # Clean header up: remove numbering and emojis
            clean_header = re.sub(r'^\d+️⃣\s*', '', header).strip()
            clean_header = re.sub(r'^[^\w\s]\s*', '', clean_header).strip() # Remove other prefix emojis like 🐳
            
            # Extract "Stands For" if present in parentheses
            stands_for = ""
            service_name = clean_header
            
            parentheses_match = re.search(r'\((.+?)\)$', clean_header)
            if parentheses_match:
                stands_for = parentheses_match.group(1).strip()
                service_name = clean_header[:parentheses_match.start()].strip()
                
            # Find the description/concept. Usually under "### 🎯 Khái Niệm Cơ Bản" or "### 💡 Khái Niệm" or "### ⚡ Khái Niệm"
            # Or just the first sentence that defines it
            description = ""
            concept_section = False
            
            for line in lines[1:]:
                line = line.strip()
                
                # Check for Khái Niệm heading
                if re.match(r'^###.+Khái Niệm', line):
                    concept_section = True
                    continue
                
                # Check for next heading to exit concept section
                if line.startswith('###') and concept_section:
                    break
                    
                if concept_section and line and not line.startswith('###'):
                    description += line + " "
                    
            # If no explicit Khái Niệm section, just try to find the first bold definition
            if not description:
                for line in lines[1:]:
                    line = line.strip()
                    if line.startswith('**' + service_name + '**') or line.startswith('**' + service_name.replace('AMAZON', '').replace('AWS', '').strip() + '**'):
                        description = line
                        break
                        
            description = description.strip()
            # Clean up the description (e.g., removing leading bold markers if they just repeat the name)
            description = re.sub(r'^\*\*.+?\*\*\s*=\s*', '', description)
            
            if service_name and len(service_name) > 2: # Very basic validation
                 glossary.append({
                    'id': service_name.lower().replace(' ', '-').replace('amazon-', '').replace('aws-', ''),
                    'group': group_name,
                    'name': service_name,
                    'standsFor': stands_for,
                    'description': description
                 })

    return glossary

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    glossary = parse_files()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(glossary, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {OUTPUT_FILE} with {len(glossary)} services.")

if __name__ == '__main__':
    main()
