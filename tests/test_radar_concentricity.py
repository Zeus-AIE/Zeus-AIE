import re
import json
import xml.etree.ElementTree as ET
import sys

def run_tests():
    svg_path = r"C:\Users\ADMIN\.gemini\antigravity\scratch\github_profile\assets\cosmic_command_bridge_v10.svg"
    failures = []
    total_tests = 6
    passed_tests = 0

    # 1. XML Well-Formedness
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
        passed_tests += 1
    except Exception as e:
        failures.append({
            "test_name": "test_xml_well_formed",
            "error_type": type(e).__name__,
            "location_line": getattr(e, 'lineno', 0),
            "error_message": str(e),
            "reproduction_input": {"path": svg_path},
            "suggested_fix": "Fix unescaped XML entities"
        })

    with open(svg_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 2. Test Radar Centered at (0, 0)
    try:
        radar_g = re.search(r'<g transform="translate\(815,\s*115\)">(.*?)</g>\s*<!-- 4\.', content, re.DOTALL)
        assert radar_g is not None, "Radar group translate(815, 115) not found"
        inner = radar_g.group(1)

        # Core circles at (0, 0)
        assert '<circle cx="0" cy="0" r="32"' in inner, "Planetary core not centered at (0, 0)"
        assert '<circle cx="0" cy="0" r="22"' in inner, "Planetary atmosphere not centered at (0, 0)"
        assert '<ellipse cx="0" cy="0" rx="84" ry="36"' in inner, "Orbital ellipse not centered at (0, 0)"
        assert '<circle cx="0" cy="0" r="90"' in inner, "Outer radar circle not centered at (0, 0)"
        assert 'x1="-90" y1="0" x2="90" y2="0"' in inner, "Horizontal crosshair not centered at 0"
        assert 'x1="0" y1="-90" x2="0" y2="90"' in inner, "Vertical crosshair not centered at 0"

        passed_tests += 1
    except AssertionError as e:
        failures.append({
            "test_name": "test_radar_local_coordinates",
            "error_type": "AssertionError",
            "location_line": 0,
            "error_message": str(e),
            "reproduction_input": {"group": "translate(815, 115)"},
            "suggested_fix": "Center all radar elements at (0, 0) within group"
        })

    # 3. Test Transform Origin Zero (Concentric Rotation)
    try:
        assert re.search(r'\.orbit-1\s*\{\s*transform-origin:\s*0px\s*0px', content) or re.search(r'\.orbit-1\s*\{\s*transform-origin:\s*0\s*0', content), "orbit-1 transform-origin is not 0px 0px"
        assert re.search(r'\.orbit-2\s*\{\s*transform-origin:\s*0px\s*0px', content) or re.search(r'\.orbit-2\s*\{\s*transform-origin:\s*0\s*0', content), "orbit-2 transform-origin is not 0px 0px"
        assert re.search(r'\.orbit-3\s*\{\s*transform-origin:\s*0px\s*0px', content) or re.search(r'\.orbit-3\s*\{\s*transform-origin:\s*0\s*0', content), "orbit-3 transform-origin is not 0px 0px"
        assert re.search(r'\.radar-line\s*\{\s*transform-origin:\s*0px\s*0px', content) or re.search(r'\.radar-line\s*\{\s*transform-origin:\s*0\s*0', content), "radar-line transform-origin is not 0px 0px"
        assert '855px 179px' not in content, "Obsolete offset 855px 179px still present in CSS"

        passed_tests += 1
    except AssertionError as e:
        failures.append({
            "test_name": "test_transform_origin_zero",
            "error_type": "AssertionError",
            "location_line": 0,
            "error_message": str(e),
            "reproduction_input": {"css_rules": [".orbit-1", ".orbit-2", ".orbit-3", ".radar-line"]},
            "suggested_fix": "Set transform-origin: 0px 0px on all rotating radar classes"
        })

    # 4. Test Bounds Containment
    try:
        radar_x = 40 + 815
        radar_y = 64 + 115
        max_r = 90
        assert (radar_x + max_r) <= 960, f"Radar exceeds right boundary: {radar_x + max_r} > 960"
        assert (radar_x - max_r) >= 40, f"Radar exceeds left boundary: {radar_x - max_r} < 40"
        assert (radar_y + max_r) <= 290, f"Radar exceeds bottom boundary: {radar_y + max_r} > 290"
        assert (radar_y - max_r) >= 64, f"Radar exceeds top boundary: {radar_y - max_r} < 64"
        passed_tests += 1
    except AssertionError as e:
        failures.append({
            "test_name": "test_bounds_containment",
            "error_type": "AssertionError",
            "location_line": 0,
            "error_message": str(e),
            "reproduction_input": {"radar_x": radar_x, "radar_y": radar_y, "max_r": max_r},
            "suggested_fix": "Adjust radar center or radius to fit inside upper deck container"
        })

    # 5. Test Asteroid Bug-01 Label
    try:
        assert '[TARGET: BUG-01]' in content, "Asteroid Bug-01 label missing"
        assert '#404_MEM_LEAK' in content, "Asteroid memory leak tag missing"
        passed_tests += 1
    except AssertionError as e:
        failures.append({
            "test_name": "test_asteroid_bug_label",
            "error_type": "AssertionError",
            "location_line": 0,
            "error_message": str(e),
            "reproduction_input": {"target": "asteroid-target"},
            "suggested_fix": "Add [TARGET: BUG-01] and #404_MEM_LEAK to asteroid-target group"
        })

    # 6. Test Target Reticle Upright (Does NOT rotate with asteroid rock)
    try:
        flight_kf = re.search(r'@keyframes asteroidFlight\s*\{(.*?)\}', content, re.DOTALL)
        assert flight_kf is not None, "@keyframes asteroidFlight not found"
        flight_body = flight_kf.group(1)
        assert 'rotate(' not in flight_body, "asteroidFlight must NOT contain rotate(...); trajectory must keep reticle level"

        assert '.asteroid-spin' in content, ".asteroid-spin class missing"
        assert 'asteroidTumble' in content, "asteroidTumble animation missing"
        assert '<g class="reticle-hud">' in content, "reticle-hud group missing"
        passed_tests += 1
    except AssertionError as e:
        failures.append({
            "test_name": "test_target_reticle_upright",
            "error_type": "AssertionError",
            "location_line": 0,
            "error_message": str(e),
            "reproduction_input": {"flight_body": flight_body if 'flight_body' in locals() else ""},
            "suggested_fix": "Remove rotate from asteroidFlight and isolate rock rotation to .asteroid-spin"
        })

    result = {
        "status": "PASSED" if len(failures) == 0 else "FAILED",
        "total_tests": total_tests,
        "passed_tests": passed_tests,
        "failed_tests": len(failures),
        "failures": failures
    }

    print(json.dumps(result, indent=2))
    return 0 if len(failures) == 0 else 1

if __name__ == "__main__":
    sys.exit(run_tests())
