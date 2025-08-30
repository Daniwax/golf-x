#!/usr/bin/env python3
"""
Extract all CSS styles from <style> tags in styles.md and create a consolidated CSS file.
"""

import re
import os

def extract_styles_from_md(md_file_path, output_css_path):
    """
    Extract all CSS content from <style> tags in a markdown file.
    
    Args:
        md_file_path: Path to the markdown file
        output_css_path: Path to the output CSS file
    """
    
    if not os.path.exists(md_file_path):
        print(f"Error: File {md_file_path} not found")
        return False
    
    # Read the markdown file
    with open(md_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match <style> tags and their content
    # This handles both <style> and <style>{` formats
    # Also handles the diff-like format with line numbers
    style_pattern = r'<style>\{`(.*?)`\}</style>'
    
    # Find all style blocks
    style_matches = re.findall(style_pattern, content, re.DOTALL)
    
    if not style_matches:
        print("No style tags found in the markdown file")
        return False
    
    # Combine all CSS content
    combined_css = []
    
    # Add header comment
    combined_css.append("/* ========================================== */")
    combined_css.append("/* CSS Extracted from styles.md              */")
    combined_css.append("/* Auto-generated - Do not edit manually     */")
    combined_css.append("/* ========================================== */")
    combined_css.append("")
    
    # Process each style block
    for i, css_content in enumerate(style_matches, 1):
        # Clean up the CSS content
        css_content = css_content.strip()
        
        # Skip empty blocks
        if not css_content:
            continue
        
        # Remove line numbers from diff-like format
        # Pattern: "number - " or "number + " at the beginning of lines
        cleaned_lines = []
        for line in css_content.split('\n'):
            # Remove line numbers like "816 - " or "625 + "
            cleaned_line = re.sub(r'^\s*\d+\s*[-+]\s*', '', line)
            cleaned_lines.append(cleaned_line)
        
        css_content = '\n'.join(cleaned_lines)
        
        # Add section comment
        combined_css.append(f"/* === Style Block {i} === */")
        combined_css.append(css_content)
        combined_css.append("")
    
    # Write to output file
    with open(output_css_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(combined_css))
    
    print(f"Successfully extracted {len(style_matches)} style blocks")
    print(f"Output saved to: {output_css_path}")
    return True

def extract_component_styles(md_file_path, output_dir):
    """
    Extract styles and organize them by component.
    
    Args:
        md_file_path: Path to the markdown file
        output_dir: Directory to save individual component CSS files
    """
    
    if not os.path.exists(md_file_path):
        print(f"Error: File {md_file_path} not found")
        return False
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Read the markdown file
    with open(md_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to find component sections with their styles
    # This looks for headers followed by style tags
    component_pattern = r'##\s+([^\n]+)\n(?:.*?)<style>(?:\{`)?([^`<]*?)(?:`\})?</style>'
    
    component_matches = re.findall(component_pattern, content, re.DOTALL)
    
    if component_matches:
        print(f"Found {len(component_matches)} component-specific styles")
        
        for component_name, css_content in component_matches:
            # Clean component name for filename
            safe_name = re.sub(r'[^\w\s-]', '', component_name).strip()
            safe_name = re.sub(r'[-\s]+', '-', safe_name).lower()
            
            # Skip if no CSS content
            if not css_content.strip():
                continue
            
            # Write component CSS file
            component_file = os.path.join(output_dir, f"{safe_name}.css")
            with open(component_file, 'w', encoding='utf-8') as f:
                f.write(f"/* {component_name} Styles */\n")
                f.write(css_content.strip())
            
            print(f"  - Created: {safe_name}.css")
    
    return True

def main():
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    md_file = os.path.join(project_root, 'styles.md')
    output_css = os.path.join(project_root, 'src', 'styles', 'extracted-styles.css')
    component_css_dir = os.path.join(project_root, 'src', 'styles', 'components')
    
    print("Style Extraction Tool")
    print("=" * 50)
    print(f"Source: {md_file}")
    print(f"Output: {output_css}")
    print()
    
    # Extract all styles to a single file
    if extract_styles_from_md(md_file, output_css):
        print()
        print("To use these styles in your React components:")
        print("1. Import the CSS file: import '../styles/extracted-styles.css';")
        print("2. Or add to your index.tsx/App.tsx for global styles")
        
        # Also extract component-specific styles
        print()
        print("Extracting component-specific styles...")
        extract_component_styles(md_file, component_css_dir)
    
    print()
    print("Extraction complete!")

if __name__ == "__main__":
    main()