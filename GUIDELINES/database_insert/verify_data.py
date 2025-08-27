#!/usr/bin/env python3
import re
import glob

def check_file(filename, expected_course_id, expected_par_total):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Extract hole data
    pattern = r'\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)'
    matches = re.findall(pattern, content)
    
    if not matches:
        print(f"[!] No data found in {filename}")
        return False
    
    ids = []
    par_total = 0
    handicaps = set()
    
    for match in matches:
        hole_id, course_id, hole_num, par, handicap = map(int, match)
        ids.append(hole_id)
        par_total += par
        handicaps.add(handicap)
        
        if course_id != expected_course_id:
            print(f"[!] Wrong course_id in {filename}: expected {expected_course_id}, got {course_id}")
    
    # Check for duplicate IDs
    if len(ids) != len(set(ids)):
        print(f"[!] Duplicate hole IDs in {filename}")
        return False
    
    # Check par total
    if par_total != expected_par_total:
        print(f"[!] Wrong par total for {filename}: expected {expected_par_total}, got {par_total}")
        return False
    else:
        print(f"[OK] {filename}: Par {expected_par_total}, IDs {min(ids)}-{max(ids)}")
    
    # Check handicaps (should be 1-18)
    if expected_course_id != 5:  # Not P&P
        expected_handicaps = set(range(1, 19))
        if handicaps != expected_handicaps:
            print(f"[!] Missing handicaps in {filename}: {expected_handicaps - handicaps}")
    
    return True

def check_tee_boxes():
    with open('05_tee_boxes.sql', 'r') as f:
        content = f.read()
    
    # Extract tee box IDs
    pattern = r'^\((\d+),.*\)'
    ids = []
    for line in content.split('\n'):
        match = re.match(pattern, line)
        if match:
            ids.append(int(match.group(1)))
    
    # Check for duplicates
    if len(ids) != len(set(ids)):
        duplicates = [x for x in ids if ids.count(x) > 1]
        print(f"[!] Duplicate tee box IDs: {set(duplicates)}")
        return False
    else:
        print(f"[OK] Tee boxes: {len(ids)} unique IDs")
    
    return True

def main():
    print("=== Verifying Golf Course Data ===\n")
    
    # Check holes files
    courses = [
        ('06_holes_course1.sql', 1, 72),
        ('06_holes_course2.sql', 2, 72),
        ('06_holes_course3.sql', 3, 72),
        ('06_holes_course4.sql', 4, 72),
        ('06_holes_course5.sql', 5, 54),  # P&P is all par 3
    ]
    
    for filename, course_id, expected_par in courses:
        check_file(filename, course_id, expected_par)
    
    print("\n=== Checking Tee Boxes ===")
    check_tee_boxes()
    
    print("\n=== Checking ID Ranges ===")
    all_hole_ids = []
    for i in range(1, 6):
        with open(f'06_holes_course{i}.sql', 'r') as f:
            pattern = r'\((\d+),'
            ids = [int(m) for m in re.findall(pattern, f.read())]
            all_hole_ids.extend(ids)
            print(f"Course {i} holes: IDs {min(ids)}-{max(ids)}")
    
    if len(all_hole_ids) != len(set(all_hole_ids)):
        print("[!] Duplicate hole IDs across files!")
    else:
        print(f"[OK] All {len(all_hole_ids)} hole IDs are unique")

if __name__ == "__main__":
    main()