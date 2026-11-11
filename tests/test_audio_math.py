import unittest
import math

class TestAudioEngineMath(unittest.TestCase):
    def test_rpm_speed_conversion(self):
        def get_playback_rate(rpm):
            return 1.35 if rpm == 45 else 1.0

        self.assertEqual(get_playback_rate(33), 1.0)
        self.assertEqual(get_playback_rate(45), 1.35)

    def test_frequency_transposition(self):
        # Transposition of A4 (440Hz) when speed is switched to 45 RPM
        base_freq = 440.0
        ratio = 45.0 / 33.333333333333336
        transposed = base_freq * ratio
        self.assertAlmostEqual(transposed, 594.0, delta=0.5)

    def test_scratch_drag_delta_clamping(self):
        # Scratch velocity should be bounded between -3.0 and +3.0
        def clamp_scratch(velocity):
            return max(-3.0, min(3.0, velocity))

        self.assertEqual(clamp_scratch(5.5), 3.0)
        self.assertEqual(clamp_scratch(-7.2), -3.0)
        self.assertEqual(clamp_scratch(1.2), 1.2)

if __name__ == "__main__":
    unittest.main()
