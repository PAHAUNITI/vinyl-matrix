import json
import re
import unittest
import math

class TestVinylDataContracts(unittest.TestCase):
    def setUp(self):
        # We will parse vinyl-data.js to verify it exports valid JSON structure
        with open(r"C:\Users\paha2\.gemini\antigravity\scratch\vinyl_archive_portal\js\data\vinyl-data.js", "r", encoding="utf-8") as f:
            content = f.read()
        
        # Extract the JSON payload from the JS file
        match = re.search(r"const\s+VINYL_DATA\s*=\s*(\{.*?\});", content, re.DOTALL)
        self.assertIsNotNone(match, "VINYL_DATA object definition must exist")
        self.data = json.loads(match.group(1))

    def test_milestones_structure(self):
        milestones = self.data.get("milestones", [])
        self.assertGreaterEqual(len(milestones), 6, "Must have at least 6 historical eras")
        for item in milestones:
            self.assertIn("year", item)
            self.assertIn("title", item)
            self.assertIn("summary", item)
            self.assertIn("details", item)
            self.assertIn("badge", item)

    def test_pioneers_data(self):
        pioneers = self.data.get("pioneers", [])
        self.assertGreaterEqual(len(pioneers), 4, "Must cover at least 4 key pioneers")
        names = [p["name"] for p in pioneers]
        self.assertTrue(any("Берлинер" in n for n in names), "Must include Emile Berliner")
        self.assertTrue(any("Голдмарк" in n for n in names), "Must include Peter Goldmark")
        self.assertTrue(any("Карузо" in n for n in names), "Must include Enrico Caruso")

    def test_thriller_record_details(self):
        records = self.data.get("records", [])
        self.assertGreaterEqual(len(records), 4, "Must have at least 4 playable albums")
        thriller = next((r for r in records if r["id"] == "thriller"), None)
        self.assertIsNotNone(thriller, "Michael Jackson Thriller must be present")
        self.assertIn("70", thriller["sales"])
        self.assertEqual(thriller["artist"], "Michael Jackson")
        self.assertIn("color", thriller)
        self.assertIn("vinylHex", thriller)

    def test_rpm_math_formula(self):
        # 33.333 RPM to 45 RPM pitch ratio test
        ratio = 45.0 / 33.333333333333336
        self.assertAlmostEqual(ratio, 1.35, places=2)
        semitones = 12 * math.log2(ratio)
        self.assertAlmostEqual(semitones, 5.19, places=1)

    def test_technical_guide(self):
        tech = self.data.get("technicalGuide", {})
        self.assertIn("groovePhysics", tech)
        self.assertIn("riaaEqualization", tech)
        self.assertIn("speeds", tech)
        self.assertIn("gradingSystem", tech)

if __name__ == "__main__":
    unittest.main()
