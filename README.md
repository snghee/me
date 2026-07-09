# me

## 문서 번역 프로그램

Python 기반 GUI 번역 앱입니다.

### 실행 방법
1. 의존성 설치
   - /home/codespace/.python/current/bin/python -m pip install -r requirements.txt
2. 실행
   - /home/codespace/.python/current/bin/python translator_app.py

### 지원 형식
- TXT
- DOCX
- PDF
- PPTX

### 출력 규칙
- 번역 결과 파일명은 원본 파일명 + _일어 또는 _한국어로 저장됩니다.
- DOCX/PPTX 안의 이미지가 포함된 경우 원본 이미지가 유지됩니다.