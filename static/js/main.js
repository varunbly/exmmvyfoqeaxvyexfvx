function getRuleFromClass(className) {
    for (let sheet of document.styleSheets) {
      for (let rule of sheet.cssRules) {
        if (rule.selectorText === `.${className}`) {
          return rule;
        }
      }
    }
    return null;
}

function listenForEvents(eventName, count, callback) {
      let currentCount = 0;

      function handler(e) {
        currentCount++;
        console.log(`${eventName} triggered ${currentCount}/${count}`);

        if (currentCount >= count) {
          document.removeEventListener(eventName, handler); // Clean up
          callback(e); // Execute final action
        }
      }

      document.addEventListener(eventName, handler);
    }