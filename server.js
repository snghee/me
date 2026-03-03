const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. 경로 설정 (한글 경로 및 공백 대응을 위해 path.resolve 권장)
const OBSIDIAN_VAULT = 'C:/Users/DAD/옵시디안_정승희/흑요석_정승희';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/**
 * 재귀적으로 .md 파일 목록 가져오기
 */
function getMdFiles(dir, baseDir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file.startsWith('.')) return; // 숨김 폴더 제외
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            results = results.concat(getMdFiles(fullPath, baseDir));
        } else if (file.endsWith('.md') && stat.size > 0) {
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            const folder = path.relative(baseDir, dir).replace(/\\/g, '/') || '루트';
            
            results.push({
                name: file,
                path: relativePath, // 보안을 위해 상대경로만 노출 권장
                folder: folder
            });
        }
    });
    return results;
}

// [API] .md 파일 목록 반환
app.get('/api/obsidian-files', (req, res) => {
    try {
        const files = getMdFiles(OBSIDIAN_VAULT, OBSIDIAN_VAULT);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [API] 파일 내용 읽기 (상대경로 파라미터 방식)
app.get('/api/obsidian-file', (req, res) => {
    try {
        const relPath = req.query.path; 
        if (!relPath) return res.status(400).json({ error: '경로가 필요합니다.' });

        const fullPath = path.join(OBSIDIAN_VAULT, relPath);

        // 보안 검사: 볼트 외부 파일 접근 차단
        if (!fullPath.startsWith(path.resolve(OBSIDIAN_VAULT))) {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ content });
    } catch (err) {
        res.status(404).json({ error: '파일을 읽을 수 없습니다: ' + err.message });
    }
});

// [API] 다운로드
app.get('/api/download', (req, res) => {
    try {
        const relPath = req.query.path;
        const fullPath = path.join(OBSIDIAN_VAULT, relPath);

        if (!fullPath.startsWith(path.resolve(OBSIDIAN_VAULT)) || !fs.existsSync(fullPath)) {
            return res.status(404).json({ error: '파일이 존재하지 않습니다.' });
        }

        const fileName = path.basename(fullPath);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        res.download(fullPath); // Express의 download 메소드 사용
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    console.log(`📂 감시 중인 폴더: ${OBSIDIAN_VAULT}`);
});
