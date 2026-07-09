import os
import tempfile
from pathlib import Path
from tkinter import filedialog as tk_filedialog

from translator_app import build_output_path, choose_source_file, translate_text_file


def test_build_output_path_for_japanese():
    path = Path("/tmp/report.txt")
    result = build_output_path(path, "ja")
    assert result == Path("/tmp/report_일어.txt")


def test_build_output_path_for_korean():
    path = Path("/tmp/report.txt")
    result = build_output_path(path, "ko")
    assert result == Path("/tmp/report_한국어.txt")


def test_translate_txt_file_with_stub_translator(tmp_path):
    source_path = tmp_path / "sample.txt"
    source_path.write_text("안녕하세요", encoding="utf-8")

    output_path = translate_text_file(
        source_path,
        source_lang="ko",
        target_lang="ja",
        translator=lambda text: f"[{text}]",
    )

    assert output_path.exists()
    assert output_path.read_text(encoding="utf-8") == "[안녕하세요]"
    assert output_path.name == "sample_일어.txt"


def test_build_output_path_uses_output_dir(tmp_path):
    source_path = tmp_path / "report.txt"
    output_dir = tmp_path / "translated"
    output_path = build_output_path(source_path, "ja", output_dir=output_dir)

    assert output_path.parent == output_dir
    assert output_path.name == "report_일어.txt"


def test_translate_txt_file_respects_output_dir(tmp_path):
    source_path = tmp_path / "sample.txt"
    source_path.write_text("안녕하세요", encoding="utf-8")
    output_dir = tmp_path / "translated"

    output_path = translate_text_file(
        source_path,
        source_lang="ko",
        target_lang="ja",
        translator=lambda text: f"[{text}]",
        output_dir=output_dir,
    )

    assert output_path.parent == output_dir
    assert output_path.exists()


def test_choose_source_file_uses_native_dialog(monkeypatch, tmp_path):
    source_path = tmp_path / "sample.txt"
    source_path.write_text("안녕하세요", encoding="utf-8")

    monkeypatch.setattr(tk_filedialog, "askopenfilename", lambda **kwargs: str(source_path))

    result = choose_source_file()

    assert result == source_path


def test_get_output_suffix_for_english():
    from translator_app import get_output_suffix

    assert get_output_suffix("en") == "영어"
