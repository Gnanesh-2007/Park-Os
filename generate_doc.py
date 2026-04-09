import os
from docx import Document
from docx.shared import Pt

directories_to_scan = []

files_to_include_explicitly = [
    'backend/server.js',
    'backend/models/ParkingSession.js',
    'backend/routes/parkingRoutes.js',
    'frontend-user/src/App.jsx',
    'frontend-user/src/pages/BookSlot.jsx'
]

document = Document()
document.add_heading('Park-Os Core Project Code', 0)

# Traverse and collect files
collected_files = files_to_include_explicitly

# Remove duplicates just in case
collected_files = list(dict.fromkeys(collected_files))

for filepath in collected_files:
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            document.add_heading(filepath, level=1)
            para = document.add_paragraph()
            run = para.add_run(content)
            run.font.name = 'Consolas'
            run.font.size = Pt(10)
            
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
    else:
        print(f"File not found: {filepath}")

document.save('Park-Os-Main-Code.docx')
print("Document generated successfully as Park-Os-Main-Code.docx")
