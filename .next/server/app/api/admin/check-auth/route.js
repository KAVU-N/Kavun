"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admin/check-auth/route";
exports.ids = ["app/api/admin/check-auth/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ogem_Documents_GitHub_kavu_n_Kavun_app_api_admin_check_auth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/check-auth/route.ts */ \"(rsc)/./app/api/admin/check-auth/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/check-auth/route\",\n        pathname: \"/api/admin/check-auth\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/check-auth/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Ogem\\\\Documents\\\\GitHub\\\\kavu_n\\\\Kavun\\\\app\\\\api\\\\admin\\\\check-auth\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ogem_Documents_GitHub_kavu_n_Kavun_app_api_admin_check_auth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/admin/check-auth/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmNoZWNrLWF1dGglMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFkbWluJTJGY2hlY2stYXV0aCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFkbWluJTJGY2hlY2stYXV0aCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNPZ2VtJTVDRG9jdW1lbnRzJTVDR2l0SHViJTVDa2F2dV9uJTVDS2F2dW4lNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q09nZW0lNUNEb2N1bWVudHMlNUNHaXRIdWIlNUNrYXZ1X24lNUNLYXZ1biZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN3QztBQUNySDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL21lZGNvZGVzX2FwcC8/MWY5ZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxPZ2VtXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxca2F2dV9uXFxcXEthdnVuXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcY2hlY2stYXV0aFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYWRtaW4vY2hlY2stYXV0aC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2FkbWluL2NoZWNrLWF1dGhcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FkbWluL2NoZWNrLWF1dGgvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxPZ2VtXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxca2F2dV9uXFxcXEthdnVuXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcY2hlY2stYXV0aFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hZG1pbi9jaGVjay1hdXRoL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/admin/check-auth/route.ts":
/*!*******************************************!*\
  !*** ./app/api/admin/check-auth/route.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nasync function GET(request) {\n    try {\n        // Token'ı cookie'den al\n        const token = (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)().get(\"admin-token\")?.value;\n        if (!token) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                authenticated: false\n            }, {\n                status: 401\n            });\n        }\n        // Token'ı doğrula\n        try {\n            const decoded = (0,jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__.verify)(token, process.env.JWT_SECRET || \"kavun-admin-secret\");\n            // Admin rolünü kontrol et\n            if (decoded.role !== \"admin\") {\n                return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                    authenticated: false\n                }, {\n                    status: 403\n                });\n            }\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                authenticated: true\n            });\n        } catch (error) {\n            // Token geçersiz veya süresi dolmuş\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                authenticated: false\n            }, {\n                status: 401\n            });\n        }\n    } catch (error) {\n        console.error(\"Auth check error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            authenticated: false,\n            message: \"Sunucu hatası\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL2NoZWNrLWF1dGgvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBdUQ7QUFDakI7QUFDRDtBQUU5QixlQUFlRyxJQUFJQyxPQUFvQjtJQUM1QyxJQUFJO1FBQ0Ysd0JBQXdCO1FBQ3hCLE1BQU1DLFFBQVFKLHFEQUFPQSxHQUFHSyxHQUFHLENBQUMsZ0JBQWdCQztRQUU1QyxJQUFJLENBQUNGLE9BQU87WUFDVixPQUFPTCxrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxlQUFlO1lBQU0sR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ25FO1FBRUEsa0JBQWtCO1FBQ2xCLElBQUk7WUFDRixNQUFNQyxVQUFVVCxvREFBTUEsQ0FBQ0csT0FBT08sUUFBUUMsR0FBRyxDQUFDQyxVQUFVLElBQUk7WUFNeEQsMEJBQTBCO1lBQzFCLElBQUlILFFBQVFJLElBQUksS0FBSyxTQUFTO2dCQUM1QixPQUFPZixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO29CQUFFQyxlQUFlO2dCQUFNLEdBQUc7b0JBQUVDLFFBQVE7Z0JBQUk7WUFDbkU7WUFFQSxPQUFPVixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxlQUFlO1lBQUs7UUFDakQsRUFBRSxPQUFPTyxPQUFPO1lBQ2Qsb0NBQW9DO1lBQ3BDLE9BQU9oQixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxlQUFlO1lBQU0sR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ25FO0lBQ0YsRUFBRSxPQUFPTSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxxQkFBcUJBO1FBQ25DLE9BQU9oQixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUN0QjtZQUFFQyxlQUFlO1lBQU9TLFNBQVM7UUFBZ0IsR0FDakQ7WUFBRVIsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZWRjb2Rlc19hcHAvLi9hcHAvYXBpL2FkbWluL2NoZWNrLWF1dGgvcm91dGUudHM/OWU2NSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJ1xuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSAnanNvbndlYnRva2VuJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgLy8gVG9rZW4nxLEgY29va2llJ2RlbiBhbFxuICAgIGNvbnN0IHRva2VuID0gY29va2llcygpLmdldCgnYWRtaW4tdG9rZW4nKT8udmFsdWVcblxuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGF1dGhlbnRpY2F0ZWQ6IGZhbHNlIH0sIHsgc3RhdHVzOiA0MDEgfSlcbiAgICB9XG5cbiAgICAvLyBUb2tlbifEsSBkb8SfcnVsYVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWNvZGVkID0gdmVyaWZ5KHRva2VuLCBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICdrYXZ1bi1hZG1pbi1zZWNyZXQnKSBhcyB7XG4gICAgICAgIHVzZXJJZDogc3RyaW5nXG4gICAgICAgIGVtYWlsOiBzdHJpbmdcbiAgICAgICAgcm9sZTogc3RyaW5nXG4gICAgICB9XG5cbiAgICAgIC8vIEFkbWluIHJvbMO8bsO8IGtvbnRyb2wgZXRcbiAgICAgIGlmIChkZWNvZGVkLnJvbGUgIT09ICdhZG1pbicpIHtcbiAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgYXV0aGVudGljYXRlZDogZmFsc2UgfSwgeyBzdGF0dXM6IDQwMyB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBhdXRoZW50aWNhdGVkOiB0cnVlIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFRva2VuIGdlw6dlcnNpeiB2ZXlhIHPDvHJlc2kgZG9sbXXFn1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgYXV0aGVudGljYXRlZDogZmFsc2UgfSwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdBdXRoIGNoZWNrIGVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgYXV0aGVudGljYXRlZDogZmFsc2UsIG1lc3NhZ2U6ICdTdW51Y3UgaGF0YXPEsScgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgIClcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNvb2tpZXMiLCJ2ZXJpZnkiLCJHRVQiLCJyZXF1ZXN0IiwidG9rZW4iLCJnZXQiLCJ2YWx1ZSIsImpzb24iLCJhdXRoZW50aWNhdGVkIiwic3RhdHVzIiwiZGVjb2RlZCIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwicm9sZSIsImVycm9yIiwiY29uc29sZSIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/check-auth/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COgem%5CDocuments%5CGitHub%5Ckavu_n%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();