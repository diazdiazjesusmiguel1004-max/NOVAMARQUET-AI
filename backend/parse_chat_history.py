import json
import os

log_path = r"C:\Users\LENOVO\.gemini\antigravity-cli\brain\d20c64d4-e434-4265-930c-7a5d4c97887d\.system_generated\logs\transcript.jsonl"
output_path = r"C:\Users\LENOVO\Desktop\proyecto de rusell\historial_chat.md"

def parse():
    if not os.path.exists(log_path):
        print(f"Log file not found at: {log_path}")
        return

    chat_history = []

    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                step_type = data.get('type')
                source = data.get('source')
                content = data.get('content', '')
                
                # Check for User Input
                if step_type == 'USER_INPUT' or source == 'USER_EXPLICIT':
                    if content and "<USER_REQUEST>" in content:
                        # Extract content inside USER_REQUEST tag
                        start = content.find("<USER_REQUEST>") + len("<USER_REQUEST>")
                        end = content.find("</USER_REQUEST>")
                        if end != -1:
                            clean_content = content[start:end].strip()
                        else:
                            clean_content = content[start:].strip()
                    else:
                        clean_content = content.strip()
                        
                    if clean_content:
                        chat_history.append({
                            'role': 'Usuario (Rusell)',
                            'message': clean_content
                        })
                        
                # Check for Model Response
                elif step_type == 'PLANNER_RESPONSE' or source == 'MODEL':
                    clean_content = content.strip()
                    if clean_content:
                        chat_history.append({
                            'role': 'Antigravity (AI)',
                            'message': clean_content
                        })
            except Exception as e:
                continue

    # Write to Markdown
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# 📝 HISTORIAL DE CHAT - NOVAMARQUET-AI\n\n")
        f.write("Este documento contiene el historial completo de la conversación y asistencia en la construcción del proyecto **NOVAMARQUET-AI**.\n\n")
        f.write("---\n\n")
        
        for entry in chat_history:
            role = entry['role']
            msg = entry['message']
            
            if role == 'Usuario (Rusell)':
                f.write(f"### 👤 **{role}**\n\n")
                # Quote user requests
                quoted_msg = "\n".join([f"> {line}" for line in msg.split("\n")])
                f.write(f"{quoted_msg}\n\n")
            else:
                f.write(f"### 🤖 **{role}**\n\n")
                f.write(f"{msg}\n\n")
            f.write("---\n\n")

    print(f"Chat history generated successfully at: {output_path}")

if __name__ == '__main__':
    parse()
