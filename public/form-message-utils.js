/**
 * FsBuddyMessageUtils
 *
 * Utility library for adding messages to Formstack form fields and interacting with forms.
 * This script provides methods to add validation messages, highlight fields, and debug form structure.
 */

(function () {
  "use strict";

  // Global namespace
  window.FsBuddyMessageUtils = {
    addFieldMessage: addFieldMessage,
    clearAllMessages: clearAllMessages,
    clearFieldMessages: clearFieldMessages,
    highlightField: highlightField,
    removeFieldHighlight: removeFieldHighlight,
    debugShowFieldContainers: debugShowFieldContainers,
    getFieldInfo: getFieldInfo,
    getAllFields: getAllFields,
  };

  /**
   * Add a message to a specific form field
   * @param {string} fieldId - The ID of the field
   * @param {string} message - The message text
   * @param {string} errorLevel - 'error', 'warn', 'info', or 'success'
   * @param {string[]} relatedFieldIds - Array of related field IDs
   * @param {string} fieldType - The type of field
   * @returns {boolean} Success status
   */
  function addFieldMessage(
    fieldId,
    message,
    errorLevel = "info",
    relatedFieldIds = [],
    fieldType = ""
  ) {
    try {
      const fieldElement = findFieldElement(fieldId);
      if (!fieldElement) {
        console.warn(
          `Field with ID ${fieldId} not found in DOM - adding to non-visible container`
        );
        addOrphanedFieldMessage(fieldId, message, errorLevel, fieldType);
        return true;
      }

      // Create message element
      const messageElement = createMessageElement(message, errorLevel, fieldId);

      // Find the appropriate insertion point
      const insertionPoint = findMessageInsertionPoint(fieldElement, fieldType);
      if (insertionPoint) {
        insertionPoint.appendChild(messageElement);

        // Highlight related fields if any
        relatedFieldIds.forEach((relatedId) => {
          highlightField(relatedId);
        });

        console.log(
          `Added ${errorLevel} message to field ${fieldId}:`,
          message
        );
        return true;
      } else {
        console.warn(
          `Could not find insertion point for field ${fieldId} - adding to non-visible container`
        );
        addOrphanedFieldMessage(fieldId, message, errorLevel, fieldType);
        return true;
      }
    } catch (error) {
      console.error("Error adding field message:", error);
      addOrphanedFieldMessage(fieldId, message, errorLevel, fieldType);
      return false;
    }
  }

  /**
   * Clear all messages from all fields
   * @returns {number} Number of messages cleared
   */
  function clearAllMessages() {
    // Clear regular field messages
    const messages = document.querySelectorAll(".fs-buddy-field-message");
    const count = messages.length;
    messages.forEach((message) => message.remove());

    // Clear orphaned messages
    const orphanedMessages = document.querySelectorAll(
      ".fs-buddy-orphaned-message"
    );
    const orphanedCount = orphanedMessages.length;
    orphanedMessages.forEach((message) => message.remove());

    // Hide orphaned container if empty
    const orphanedContainer = document.getElementById(
      "fs-buddy-orphaned-messages"
    );
    if (orphanedContainer) {
      orphanedContainer.style.display = "none";
    }

    // Clear all field highlights
    document
      .querySelectorAll(".fs-buddy-field-highlight")
      .forEach((element) => {
        element.classList.remove("fs-buddy-field-highlight");
      });

    const totalCount = count + orphanedCount;
    console.log(
      `Cleared ${count} regular messages and ${orphanedCount} orphaned messages (${totalCount} total)`
    );
    return totalCount;
  }

  /**
   * Clear messages from a specific field
   * @param {string} fieldId - The field ID
   * @returns {number} Number of messages cleared
   */
  function clearFieldMessages(fieldId) {
    const messages = document.querySelectorAll(
      `.fs-buddy-field-message[data-field-id="${fieldId}"]`
    );
    const count = messages.length;
    messages.forEach((message) => message.remove());
    removeFieldHighlight(fieldId);
    return count;
  }

  /**
   * Highlight a specific field
   * @param {string} fieldId - The field ID
   */
  function highlightField(fieldId) {
    const fieldElement = findFieldElement(fieldId);
    if (fieldElement) {
      const input = fieldElement.querySelector("input, select, textarea");
      if (input) {
        input.classList.add("fs-buddy-field-highlight");
      }
    }
  }

  /**
   * Remove highlight from a specific field
   * @param {string} fieldId - The field ID
   */
  function removeFieldHighlight(fieldId) {
    const fieldElement = findFieldElement(fieldId);
    if (fieldElement) {
      const input = fieldElement.querySelector("input, select, textarea");
      if (input) {
        input.classList.remove("fs-buddy-field-highlight");
      }
    }
  }

  /**
   * Debug function to show field containers
   */
  function debugShowFieldContainers() {
    console.log("=== DEBUG: Starting field container analysis ===");

    // Log all potential field containers
    const potentialContainers = document.querySelectorAll(
      '[id*="field"], [class*="field"], [class*="fs"], input, select, textarea'
    );
    console.log(
      `Found ${potentialContainers.length} potential field elements:`,
      potentialContainers
    );

    const fields = getAllFields();
    console.log(`Processed fields found: ${fields.length}`, fields);

    // Show a visual indicator for debug
    const debugDiv = document.createElement("div");
    debugDiv.style.position = "fixed";
    debugDiv.style.top = "10px";
    debugDiv.style.right = "10px";
    debugDiv.style.padding = "10px";
    debugDiv.style.backgroundColor = "red";
    debugDiv.style.color = "white";
    debugDiv.style.zIndex = "9999";
    debugDiv.style.borderRadius = "5px";
    debugDiv.innerHTML = `DEBUG: Found ${fields.length} fields`;
    document.body.appendChild(debugDiv);

    // Remove debug div after 3 seconds
    setTimeout(() => {
      if (debugDiv.parentNode) {
        debugDiv.parentNode.removeChild(debugDiv);
      }
    }, 3000);

    // Temporarily highlight all field containers
    fields.forEach((field, index) => {
      if (field.element) {
        field.element.style.outline = "3px dashed #ff0000";
        field.element.style.backgroundColor = "rgba(255, 0, 0, 0.1)";

        // Add a label
        const label = document.createElement("div");
        label.style.position = "absolute";
        label.style.top = "0";
        label.style.left = "0";
        label.style.backgroundColor = "red";
        label.style.color = "white";
        label.style.padding = "2px 5px";
        label.style.fontSize = "12px";
        label.style.zIndex = "1000";
        label.textContent = `Field ${field.id || index}`;
        field.element.style.position = "relative";
        field.element.appendChild(label);

        setTimeout(() => {
          field.element.style.outline = "";
          field.element.style.backgroundColor = "";
          if (label.parentNode) {
            label.parentNode.removeChild(label);
          }
        }, 5000);
      }
    });

    // Also try to find fields by common Formstack patterns
    const fsElements = document.querySelectorAll(
      '.fsFieldRow, .fsField, [id^="field"], [class*="fsField"]'
    );
    console.log(
      `Found ${fsElements.length} elements with Formstack patterns:`,
      fsElements
    );

    fsElements.forEach((element, index) => {
      element.style.border = "2px solid blue";
      setTimeout(() => {
        element.style.border = "";
      }, 5000);
    });
  }

  /**
   * Get information about a specific field
   * @param {string} fieldId - The field ID
   * @returns {object|null} Field information
   */
  function getFieldInfo(fieldId) {
    const fieldElement = findFieldElement(fieldId);
    if (!fieldElement) return null;

    const input = fieldElement.querySelector("input, select, textarea");
    const label = fieldElement.querySelector("label");

    return {
      id: fieldId,
      element: fieldElement,
      input: input,
      label: label ? label.textContent.trim() : "",
      type: input ? input.type || input.tagName.toLowerCase() : "unknown",
      name: input ? input.name : "",
      value: input ? input.value : "",
      required: input ? input.required : false,
    };
  }

  /**
   * Get all fields in the form
   * @returns {Array} Array of field information objects
   */
  function getAllFields() {
    const fields = [];
    const fieldElements = document.querySelectorAll(
      '[id^="field"], .fsFieldRow, .fsField'
    );

    fieldElements.forEach((element) => {
      const input = element.querySelector("input, select, textarea");
      if (input) {
        const fieldId = extractFieldId(element, input);
        if (fieldId) {
          const fieldInfo = getFieldInfo(fieldId);
          if (fieldInfo) {
            fields.push(fieldInfo);
          }
        }
      }
    });

    return fields;
  }

  /**
   * Add a message to the orphaned (non-visible) fields container
   * @param {string} fieldId - The field ID
   * @param {string} message - The message text
   * @param {string} errorLevel - The error level
   * @param {string} fieldType - The field type
   */
  function addOrphanedFieldMessage(fieldId, message, errorLevel, fieldType) {
    // Get or create the orphaned messages container
    let container = document.getElementById("fs-buddy-orphaned-messages");

    if (!container) {
      container = createOrphanedMessagesContainer();
    }

    // Create the message element for orphaned field
    const messageDiv = document.createElement("div");
    messageDiv.className = `fs-buddy-orphaned-message ${errorLevel}`;
    messageDiv.setAttribute("data-field-id", fieldId);

    // Create field info header
    const fieldHeader = document.createElement("div");
    fieldHeader.className = "fs-buddy-orphaned-field-header";
    fieldHeader.innerHTML = `
            <strong>Field ${fieldId}</strong> 
            ${fieldType ? `<span class="field-type">(${fieldType})</span>` : ""}
            <span class="non-visible-badge">Non-visible Field</span>
        `;

    // Create message content
    const messageContent = document.createElement("div");
    messageContent.className = "fs-buddy-orphaned-message-content";
    messageContent.textContent = message;

    messageDiv.appendChild(fieldHeader);
    messageDiv.appendChild(messageContent);

    // Add to container
    const messagesList = container.querySelector(
      ".fs-buddy-orphaned-messages-list"
    );
    messagesList.appendChild(messageDiv);

    // Show the container if it was hidden
    container.style.display = "block";

    console.log(`Added orphaned message for field ${fieldId}:`, message);
  }

  /**
   * Create the orphaned messages container
   */
  function createOrphanedMessagesContainer() {
    const container = document.createElement("div");
    container.id = "fs-buddy-orphaned-messages";
    container.className = "fs-buddy-orphaned-messages-container";

    // Create header
    const header = document.createElement("div");
    header.className = "fs-buddy-orphaned-messages-header";
    header.innerHTML = `
            <h3>📋 Messages for Non-Visible Fields</h3>
            <p>These messages belong to fields that are not visible on the form (descriptions, sections, embeds, etc.)</p>
        `;

    // Create collapsible toggle
    const toggle = document.createElement("button");
    toggle.className = "fs-buddy-toggle-orphaned";
    toggle.innerHTML = "▼ Hide Messages";
    toggle.onclick = function () {
      const messagesList = container.querySelector(
        ".fs-buddy-orphaned-messages-list"
      );
      const isVisible = messagesList.style.display !== "none";
      messagesList.style.display = isVisible ? "none" : "block";
      toggle.innerHTML = isVisible ? "▶ Show Messages" : "▼ Hide Messages";
    };

    // Create messages list
    const messagesList = document.createElement("div");
    messagesList.className = "fs-buddy-orphaned-messages-list";

    // Assemble container
    header.appendChild(toggle);
    container.appendChild(header);
    container.appendChild(messagesList);

    // Insert at the top of the form
    const formContainer = document.querySelector(".fsForm, form, body");
    if (formContainer) {
      formContainer.insertBefore(container, formContainer.firstChild);
    } else {
      document.body.appendChild(container);
    }

    return container;
  }

  // Helper functions

  /**
   * Find the DOM element for a field
   * @param {string} fieldId - The field ID
   * @returns {Element|null} The field element
   */
  function findFieldElement(fieldId) {
    console.log(`Looking for field with ID: ${fieldId}`);

    // Try various selectors to find the field - Formstack specific
    const selectors = [
      `#field${fieldId}`,
      `#fsfield${fieldId}`,
      `[id="field${fieldId}"]`,
      `[id="fsfield${fieldId}"]`,
      `[data-field-id="${fieldId}"]`,
      `input[id="${fieldId}"]`,
      `select[id="${fieldId}"]`,
      `textarea[id="${fieldId}"]`,
      `input[name*="${fieldId}"]`,
      `select[name*="${fieldId}"]`,
      `textarea[name*="${fieldId}"]`,
      // Formstack specific patterns
      `.fsFieldRow[id*="${fieldId}"]`,
      `.fsField[id*="${fieldId}"]`,
      `[class*="field${fieldId}"]`,
      `[id*="${fieldId}"]`,
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          console.log(
            `Found field ${fieldId} with selector: ${selector}`,
            element
          );
          // Return the field container, not just the input
          const container =
            element.closest(
              ".fsFieldRow, .fsField, .form-group, .field-container"
            ) ||
            element.closest('[class*="field"]') ||
            element.parentElement;
          console.log(`Field container for ${fieldId}:`, container);
          return container;
        }
      } catch (e) {
        // Ignore selector errors
      }
    }

    console.warn(`Field ${fieldId} not found with any selector`);
    return null;
  }

  /**
   * Create a message element
   * @param {string} message - The message text
   * @param {string} errorLevel - The error level
   * @param {string} fieldId - The field ID
   * @returns {Element} The message element
   */
  function createMessageElement(message, errorLevel, fieldId) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `fs-buddy-field-message ${errorLevel}`;
    messageDiv.setAttribute("data-field-id", fieldId);
    messageDiv.textContent = message;
    return messageDiv;
  }

  /**
   * Find the best insertion point for a message
   * @param {Element} fieldElement - The field element
   * @param {string} fieldType - The field type
   * @returns {Element|null} The insertion point
   */
  function findMessageInsertionPoint(fieldElement, fieldType) {
    // Look for existing message containers
    let container = fieldElement.querySelector(
      ".fsValidationError, .field-help, .help-text"
    );

    if (!container) {
      // Create a container at the end of the field
      container = document.createElement("div");
      container.className = "fs-buddy-message-container";
      fieldElement.appendChild(container);
    }

    return container;
  }

  /**
   * Extract field ID from element
   * @param {Element} element - The field element
   * @param {Element} input - The input element
   * @returns {string|null} The field ID
   */
  function extractFieldId(element, input) {
    // Try to extract ID from various sources
    if (element.id && element.id.includes("field")) {
      return element.id.replace("field", "");
    }

    if (input.id) {
      return input.id.replace(/^field/, "");
    }

    if (input.name) {
      const match = input.name.match(/\d+/);
      return match ? match[0] : null;
    }

    return null;
  }

  console.log("FsBuddyMessageUtils loaded successfully");
})();
