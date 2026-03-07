import os

def print_directory_structure_to_file(start_path, output_filename="directory_structure.txt"):
    """
    Traverses the directory tree starting from start_path and writes the 
    structure to a file.
    
    Args:
        start_path (str): The path to the root directory to traverse.
        output_filename (str): The name of the file to write the output to.
    """
    with open(output_filename, "w", encoding="utf-8") as f:
        print(f"Directory structure of: {os.path.abspath(start_path)}\n", file=f)
        for root, dirs, files in os.walk(start_path):
            level = root.replace(start_path, '').count(os.sep)
            indent = ' ' * 4 * level
            
            # Print current directory
            print(f'{indent}📁 {os.path.basename(root)}/', file=f)
            
            # Print files in the current directory with indentation
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                print(f'{sub_indent}📄 {file}', file=f)

# --- Example Usage ---
# Specify the directory you want to document
# Use '.' to start from the current working directory, or a specific path like 'C:/Users/YourUser/Documents'
directory_to_scan = '.' 

# Specify the output file name
output_file = "directory_structure.txt"

# Run the function
print_directory_structure_to_file(directory_to_scan, output_file)
print(f"Directory structure has been written to {os.path.abspath(output_file)}")
