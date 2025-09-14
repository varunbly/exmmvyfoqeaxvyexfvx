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