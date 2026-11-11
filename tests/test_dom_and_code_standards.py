import os
import re
import unittest

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class TestDomAndCodeStandards(unittest.TestCase):
    def test_html_dom_elements_exist(self):
        index_path = os.path.join(PROJECT_DIR, "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            html = f.read()

        required_ids = [
            "turntable-power-btn",
            "turntable-power-led",
            "rpm-btn-33",
            "rpm-btn-45",
            "tonearm-assembly",
            "cue-lever-btn",
            "global-mute-btn",
            "vinyl-platter-disc",
            "vinyl-center-label",
            "turntable-status-text",
            "now-playing-title",
            "now-playing-artist",
            "now-playing-year",
            "now-playing-genre",
            "now-playing-track",
            "now-playing-label",
            "visualizer-canvas",
            "timeline-grid",
            "pioneers-grid",
            "crate-selector-grid",
            "grading-select",
            "grade-output-title",
            "grade-fidelity-bar",
            "grade-value-bar",
            "detail-modal",
            "modal-close-btn",
            "mouse-ambient-glow"
        ]

        for elem_id in required_ids:
            self.assertIn(f'id="{elem_id}"', html, f"Missing element with id '{elem_id}' in index.html")

    def test_css_files_linked_and_exist(self):
        css_files = ["tokens.css", "brutalist-grid.css", "components.css", "animations.css"]
        for css in css_files:
            css_path = os.path.join(PROJECT_DIR, "css", css)
            self.assertTrue(os.path.exists(css_path), f"CSS file {css} must exist on disk")
            self.assertGreater(os.path.getsize(css_path), 100, f"CSS file {css} must not be empty")

    def test_js_files_linked_and_exist(self):
        js_files = [
            os.path.join("js", "data", "vinyl-data.js"),
            os.path.join("js", "audio", "vinyl-engine.js"),
            os.path.join("js", "components", "turntable.js"),
            os.path.join("js", "components", "visualizer.js"),
            os.path.join("js", "components", "ui-interactions.js"),
            os.path.join("js", "app.js")
        ]
        for js in js_files:
            js_path = os.path.join(PROJECT_DIR, js)
            self.assertTrue(os.path.exists(js_path), f"JS file {js} must exist on disk")

    def test_ecc_file_size_limits(self):
        # Everything Claude Code rule: all files must be < 800 lines
        for root, _, files in os.walk(PROJECT_DIR):
            for file in files:
                if file.endswith((".js", ".css", ".html")) and not file.startswith("test_"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                    self.assertLess(
                        len(lines), 800,
                        f"File {file} has {len(lines)} lines, exceeding ECC limit of 800 lines!"
                    )

if __name__ == "__main__":
    unittest.main()
