"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/exenv";
exports.ids = ["vendor-chunks/exenv"];
exports.modules = {

/***/ "(ssr)/./node_modules/exenv/index.js":
/*!*************************************!*\
  !*** ./node_modules/exenv/index.js ***!
  \*************************************/
/***/ ((module, exports, __webpack_require__) => {

eval("var __WEBPACK_AMD_DEFINE_RESULT__;\n/*!\r\n  Copyright (c) 2015 Jed Watson.\r\n  Based on code that is Copyright 2013-2015, Facebook, Inc.\r\n  All rights reserved.\r\n*/ /* global define */ (function() {\n    \"use strict\";\n    var canUseDOM = !!( false && 0);\n    var ExecutionEnvironment = {\n        canUseDOM: canUseDOM,\n        canUseWorkers: typeof Worker !== \"undefined\",\n        canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),\n        canUseViewport: canUseDOM && !!window.screen\n    };\n    if (true) {\n        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {\n            return ExecutionEnvironment;\n        }).call(exports, __webpack_require__, exports, module),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n    } else {}\n})();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvZXhlbnYvaW5kZXguanMiLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBSUEsR0FDQSxpQkFBaUIsR0FFaEI7SUFDQTtJQUVBLElBQUlBLFlBQVksQ0FBQyxDQUNoQixPQUNlLElBQ2ZDLENBQTZCO0lBRzlCLElBQUlHLHVCQUF1QjtRQUUxQkosV0FBV0E7UUFFWEssZUFBZSxPQUFPQyxXQUFXO1FBRWpDQyxzQkFDQ1AsYUFBYSxDQUFDLENBQUVDLENBQUFBLE9BQU9PLGdCQUFnQixJQUFJUCxPQUFPUSxXQUFXO1FBRTlEQyxnQkFBZ0JWLGFBQWEsQ0FBQyxDQUFDQyxPQUFPVSxNQUFNO0lBRTdDO0lBRUEsSUFBSSxJQUE0RSxFQUFFO1FBQ2pGQyxtQ0FBTztZQUNOLE9BQU9SO1FBQ1IsQ0FBQztBQUFBLGtHQUFDO0lBQ0gsT0FBTyxFQUlOO0FBRUYiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZWRjb2Rlc19hcHAvLi9ub2RlX21vZHVsZXMvZXhlbnYvaW5kZXguanM/Y2MxNiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICBDb3B5cmlnaHQgKGMpIDIwMTUgSmVkIFdhdHNvbi5cclxuICBCYXNlZCBvbiBjb2RlIHRoYXQgaXMgQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cclxuICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4qL1xyXG4vKiBnbG9iYWwgZGVmaW5lICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0dmFyIGNhblVzZURPTSA9ICEhKFxyXG5cdFx0dHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcclxuXHRcdHdpbmRvdy5kb2N1bWVudCAmJlxyXG5cdFx0d2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnRcclxuXHQpO1xyXG5cclxuXHR2YXIgRXhlY3V0aW9uRW52aXJvbm1lbnQgPSB7XHJcblxyXG5cdFx0Y2FuVXNlRE9NOiBjYW5Vc2VET00sXHJcblxyXG5cdFx0Y2FuVXNlV29ya2VyczogdHlwZW9mIFdvcmtlciAhPT0gJ3VuZGVmaW5lZCcsXHJcblxyXG5cdFx0Y2FuVXNlRXZlbnRMaXN0ZW5lcnM6XHJcblx0XHRcdGNhblVzZURPTSAmJiAhISh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciB8fCB3aW5kb3cuYXR0YWNoRXZlbnQpLFxyXG5cclxuXHRcdGNhblVzZVZpZXdwb3J0OiBjYW5Vc2VET00gJiYgISF3aW5kb3cuc2NyZWVuXHJcblxyXG5cdH07XHJcblxyXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XHJcblx0XHRkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gRXhlY3V0aW9uRW52aXJvbm1lbnQ7XHJcblx0XHR9KTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEV4ZWN1dGlvbkVudmlyb25tZW50O1xyXG5cdH0gZWxzZSB7XHJcblx0XHR3aW5kb3cuRXhlY3V0aW9uRW52aXJvbm1lbnQgPSBFeGVjdXRpb25FbnZpcm9ubWVudDtcclxuXHR9XHJcblxyXG59KCkpO1xyXG4iXSwibmFtZXMiOlsiY2FuVXNlRE9NIiwid2luZG93IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiRXhlY3V0aW9uRW52aXJvbm1lbnQiLCJjYW5Vc2VXb3JrZXJzIiwiV29ya2VyIiwiY2FuVXNlRXZlbnRMaXN0ZW5lcnMiLCJhZGRFdmVudExpc3RlbmVyIiwiYXR0YWNoRXZlbnQiLCJjYW5Vc2VWaWV3cG9ydCIsInNjcmVlbiIsImRlZmluZSIsImFtZCIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/exenv/index.js\n");

/***/ })

};
;