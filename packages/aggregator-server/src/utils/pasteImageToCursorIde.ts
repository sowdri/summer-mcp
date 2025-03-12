import os from "os";
import { exec } from "child_process";

/**
 * Utility function to paste an image into the Cursor IDE
 * 
 * This function handles pasting images into the Cursor IDE on macOS systems
 * using AppleScript. It provides a robust implementation with fallback mechanisms
 * and detailed error reporting.
 * 
 * The function:
 * 1. Checks if running on macOS and if auto-paste is enabled
 * 2. Copies the image to clipboard
 * 3. Activates the Cursor application
 * 4. Attempts to find and focus a text input element
 * 5. Pastes the image and adds a descriptive text
 * 6. Falls back to simpler methods if the primary approach fails
 * 
 * @param {Object} args - Function arguments
 * @param {boolean} [args.autoPaste=true] - Whether to automatically paste the image
 * @param {string} args.fullPath - Full path to the image file to be pasted
 * @returns {void}
 */

export function pasteImageToCursorIde(args: {
    autoPaste?: boolean,
    fullPath: string
}) {
    const { autoPaste = true, fullPath } = args;
    // Check if running on macOS before executing AppleScript
    if (os.platform() === "darwin" && autoPaste === true) {
        console.log(
          "Browser Connector: Running on macOS with auto-paste enabled, executing AppleScript to paste into Cursor"
        );

        // Create the AppleScript to copy the image to clipboard and paste into Cursor
        // This version is more robust and includes debugging
        const appleScript = `
          -- Set path to the screenshot
          set imagePath to "${fullPath}"
          
          -- Copy the image to clipboard
          try
            set the clipboard to (read (POSIX file imagePath) as «class PNGf»)
          on error errMsg
            log "Error copying image to clipboard: " & errMsg
            return "Failed to copy image to clipboard: " & errMsg
          end try
          
          -- Activate Cursor application
          try
            tell application "Cursor"
              activate
            end tell
          on error errMsg
            log "Error activating Cursor: " & errMsg
            return "Failed to activate Cursor: " & errMsg
          end try
          
          -- Wait for the application to fully activate
          delay 3
          
          -- Try to interact with Cursor
          try
            tell application "System Events"
              tell process "Cursor"
                -- Get the frontmost window
                if (count of windows) is 0 then
                  return "No windows found in Cursor"
                end if
                
                set cursorWindow to window 1
                
                -- Try Method 1: Look for elements of class "Text Area"
                set foundElements to {}
                
                -- Try different selectors to find the text input area
                try
                  -- Try with class
                  set textAreas to UI elements of cursorWindow whose class is "Text Area"
                  if (count of textAreas) > 0 then
                    set foundElements to textAreas
                  end if
                end try
                
                if (count of foundElements) is 0 then
                  try
                    -- Try with AXTextField role
                    set textFields to UI elements of cursorWindow whose role is "AXTextField"
                    if (count of textFields) > 0 then
                      set foundElements to textFields
                    end if
                  end try
                end if
                
                if (count of foundElements) is 0 then
                  try
                    -- Try with AXTextArea role in nested elements
                    set allElements to UI elements of cursorWindow
                    repeat with anElement in allElements
                      try
                        set childElements to UI elements of anElement
                        repeat with aChild in childElements
                          try
                            if role of aChild is "AXTextArea" or role of aChild is "AXTextField" then
                              set end of foundElements to aChild
                            end if
                          end try
                        end repeat
                      end try
                    end repeat
                  end try
                end if
                
                -- If no elements found with specific attributes, try a broader approach
                if (count of foundElements) is 0 then
                  -- Just try to use the Command+V shortcut on the active window
                   -- This assumes Cursor already has focus on the right element
                    keystroke "v" using command down
                    delay 1
                    keystroke "here is the screenshot"
                    delay 1
                   -- Try multiple methods to press Enter
                   key code 36 -- Use key code for Return key
                   delay 0.5
                   keystroke return -- Use keystroke return as alternative
                   return "Used fallback method: Command+V on active window"
                else
                  -- We found a potential text input element
                  set inputElement to item 1 of foundElements
                  
                  -- Try to focus and paste
                  try
                    set focused of inputElement to true
                    delay 0.5
                    
                    -- Paste the image
                    keystroke "v" using command down
                    delay 1
                    
                    -- Type the text
                    keystroke "here is the screenshot"
                    delay 1
                    -- Try multiple methods to press Enter
                    key code 36 -- Use key code for Return key
                    delay 0.5
                    keystroke return -- Use keystroke return as alternative
                    return "Successfully pasted screenshot into Cursor text element"
                  on error errMsg
                    log "Error interacting with found element: " & errMsg
                    -- Fallback to just sending the key commands
                    keystroke "v" using command down
                    delay 1
                    keystroke "here is the screenshot"
                    delay 1
                    -- Try multiple methods to press Enter
                    key code 36 -- Use key code for Return key
                    delay 0.5
                    keystroke return -- Use keystroke return as alternative
                    return "Used fallback after element focus error: " & errMsg
                  end try
                end if
              end tell
            end tell
          on error errMsg
            log "Error in System Events block: " & errMsg
            return "Failed in System Events: " & errMsg
          end try
        `;

        // Execute the AppleScript
        exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
          if (error) {
            console.error(
              `Browser Connector: Error executing AppleScript: ${error.message}`
            );
            console.error(`Browser Connector: stderr: ${stderr}`);
            // Don't fail the response; log the error and proceed
          } else {
            console.log(`Browser Connector: AppleScript executed successfully`);
            console.log(`Browser Connector: stdout: ${stdout}`);
          }
        });
      } else {
        if (os.platform() === "darwin" && !autoPaste) {
          console.log(
            `Browser Connector: Running on macOS but auto-paste is disabled, skipping AppleScript execution`
          );
        } else {
          console.log(
            `Browser Connector: Not running on macOS, skipping AppleScript execution`
          );
        }
      }
    }