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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_musta_OneDrive_Belgeler_GitHub_Kavun_app_api_admin_check_auth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/check-auth/route.ts */ \"(rsc)/./app/api/admin/check-auth/route.ts\");\n\r\n\r\n\r\n\r\n// We inject the nextConfigOutput here so that we can use them in the route\r\n// module.\r\nconst nextConfigOutput = \"\"\r\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\r\n    definition: {\r\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\r\n        page: \"/api/admin/check-auth/route\",\r\n        pathname: \"/api/admin/check-auth\",\r\n        filename: \"route\",\r\n        bundlePath: \"app/api/admin/check-auth/route\"\r\n    },\r\n    resolvedPagePath: \"C:\\\\Users\\\\musta\\\\OneDrive\\\\Belgeler\\\\GitHub\\\\Kavun\\\\app\\\\api\\\\admin\\\\check-auth\\\\route.ts\",\r\n    nextConfigOutput,\r\n    userland: C_Users_musta_OneDrive_Belgeler_GitHub_Kavun_app_api_admin_check_auth_route_ts__WEBPACK_IMPORTED_MODULE_3__\r\n});\r\n// Pull out the exports that we need to expose from the module. This should\r\n// be eliminated when we've moved the other routes to the new format. These\r\n// are used to hook into the route.\r\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\r\nconst originalPathname = \"/api/admin/check-auth/route\";\r\nfunction patchFetch() {\r\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\r\n        serverHooks,\r\n        staticGenerationAsyncStorage\r\n    });\r\n}\r\n\r\n\r\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmNoZWNrLWF1dGglMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFkbWluJTJGY2hlY2stYXV0aCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFkbWluJTJGY2hlY2stYXV0aCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNtdXN0YSU1Q09uZURyaXZlJTVDQmVsZ2VsZXIlNUNHaXRIdWIlNUNLYXZ1biU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDbXVzdGElNUNPbmVEcml2ZSU1Q0JlbGdlbGVyJTVDR2l0SHViJTVDS2F2dW4maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDMEM7QUFDdkg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2SjtBQUM3SjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWVkY29kZXNfYXBwLz9iM2JhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XHJcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XHJcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcclxuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXG11c3RhXFxcXE9uZURyaXZlXFxcXEJlbGdlbGVyXFxcXEdpdEh1YlxcXFxLYXZ1blxcXFxhcHBcXFxcYXBpXFxcXGFkbWluXFxcXGNoZWNrLWF1dGhcXFxccm91dGUudHNcIjtcclxuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXHJcbi8vIG1vZHVsZS5cclxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcclxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XHJcbiAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcclxuICAgICAgICBwYWdlOiBcIi9hcGkvYWRtaW4vY2hlY2stYXV0aC9yb3V0ZVwiLFxyXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vY2hlY2stYXV0aFwiLFxyXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXHJcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FkbWluL2NoZWNrLWF1dGgvcm91dGVcIlxyXG4gICAgfSxcclxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcbXVzdGFcXFxcT25lRHJpdmVcXFxcQmVsZ2VsZXJcXFxcR2l0SHViXFxcXEthdnVuXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcY2hlY2stYXV0aFxcXFxyb3V0ZS50c1wiLFxyXG4gICAgbmV4dENvbmZpZ091dHB1dCxcclxuICAgIHVzZXJsYW5kXHJcbn0pO1xyXG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcclxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXHJcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXHJcbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCB9ID0gcm91dGVNb2R1bGU7XHJcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYWRtaW4vY2hlY2stYXV0aC9yb3V0ZVwiO1xyXG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xyXG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcclxuICAgICAgICBzZXJ2ZXJIb29rcyxcclxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XHJcblxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/admin/check-auth/route.ts":
/*!*******************************************!*\
  !*** ./app/api/admin/check-auth/route.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nasync function GET(request) {\n    try {\n        // Token'ı cookie'den al\n        const token = (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)().get(\"admin-token\")?.value;\n        if (!token) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                authenticated: false\n            }, {\n                status: 401\n            });\n        }\n        // Token'ı doğrula\n        try {\n            const decoded = (0,jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__.verify)(token, process.env.JWT_SECRET || \"kavun-admin-secret\");\n            // Admin rolünü kontrol et\n            if (decoded.role !== \"admin\") {\n                return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                    authenticated: false\n                }, {\n                    status: 403\n                });\n            }\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                authenticated: true\n            });\n        } catch (error) {\n            // Token geçersiz veya süresi dolmuş\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                authenticated: false\n            }, {\n                status: 401\n            });\n        }\n    } catch (error) {\n        console.error(\"Auth check error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            authenticated: false,\n            message: \"Sunucu hatası\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL2NoZWNrLWF1dGgvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBdUQ7QUFDakI7QUFDRDtBQUU5QixlQUFlRyxJQUFJQyxPQUFvQjtJQUM1QyxJQUFJO1FBQ0Ysd0JBQXdCO1FBQ3hCLE1BQU1DLFFBQVFKLHFEQUFPQSxHQUFHSyxHQUFHLENBQUMsZ0JBQWdCQztRQUU1QyxJQUFJLENBQUNGLE9BQU87WUFDVixPQUFPTCxrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxlQUFlO1lBQU0sR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ25FO1FBRUEsa0JBQWtCO1FBQ2xCLElBQUk7WUFDRixNQUFNQyxVQUFVVCxvREFBTUEsQ0FBQ0csT0FBT08sUUFBUUMsR0FBRyxDQUFDQyxVQUFVLElBQUk7WUFNeEQsMEJBQTBCO1lBQzFCLElBQUlILFFBQVFJLElBQUksS0FBSyxTQUFTO2dCQUM1QixPQUFPZixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO29CQUFFQyxlQUFlO2dCQUFNLEdBQUc7b0JBQUVDLFFBQVE7Z0JBQUk7WUFDbkU7WUFFQSxPQUFPVixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxlQUFlO1lBQUs7UUFDakQsRUFBRSxPQUFPTyxPQUFPO1lBQ2Qsb0NBQW9DO1lBQ3BDLE9BQU9oQixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxlQUFlO1lBQU0sR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ25FO0lBQ0YsRUFBRSxPQUFPTSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxxQkFBcUJBO1FBQ25DLE9BQU9oQixrRkFBWUEsQ0FBQ1EsSUFBSSxDQUN0QjtZQUFFQyxlQUFlO1lBQU9TLFNBQVM7UUFBZ0IsR0FDakQ7WUFBRVIsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZWRjb2Rlc19hcHAvLi9hcHAvYXBpL2FkbWluL2NoZWNrLWF1dGgvcm91dGUudHM/OWU2NSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXHJcbmltcG9ydCB7IGNvb2tpZXMgfSBmcm9tICduZXh0L2hlYWRlcnMnXHJcbmltcG9ydCB7IHZlcmlmeSB9IGZyb20gJ2pzb253ZWJ0b2tlbidcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgLy8gVG9rZW4nxLEgY29va2llJ2RlbiBhbFxyXG4gICAgY29uc3QgdG9rZW4gPSBjb29raWVzKCkuZ2V0KCdhZG1pbi10b2tlbicpPy52YWx1ZVxyXG5cclxuICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgYXV0aGVudGljYXRlZDogZmFsc2UgfSwgeyBzdGF0dXM6IDQwMSB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRva2VuJ8SxIGRvxJ9ydWxhXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBkZWNvZGVkID0gdmVyaWZ5KHRva2VuLCBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICdrYXZ1bi1hZG1pbi1zZWNyZXQnKSBhcyB7XHJcbiAgICAgICAgdXNlcklkOiBzdHJpbmdcclxuICAgICAgICBlbWFpbDogc3RyaW5nXHJcbiAgICAgICAgcm9sZTogc3RyaW5nXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkbWluIHJvbMO8bsO8IGtvbnRyb2wgZXRcclxuICAgICAgaWYgKGRlY29kZWQucm9sZSAhPT0gJ2FkbWluJykge1xyXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGF1dGhlbnRpY2F0ZWQ6IGZhbHNlIH0sIHsgc3RhdHVzOiA0MDMgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgYXV0aGVudGljYXRlZDogdHJ1ZSB9KVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgLy8gVG9rZW4gZ2XDp2Vyc2l6IHZleWEgc8O8cmVzaSBkb2xtdcWfXHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGF1dGhlbnRpY2F0ZWQ6IGZhbHNlIH0sIHsgc3RhdHVzOiA0MDEgfSlcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignQXV0aCBjaGVjayBlcnJvcjonLCBlcnJvcilcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBhdXRoZW50aWNhdGVkOiBmYWxzZSwgbWVzc2FnZTogJ1N1bnVjdSBoYXRhc8SxJyB9LFxyXG4gICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgIClcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNvb2tpZXMiLCJ2ZXJpZnkiLCJHRVQiLCJyZXF1ZXN0IiwidG9rZW4iLCJnZXQiLCJ2YWx1ZSIsImpzb24iLCJhdXRoZW50aWNhdGVkIiwic3RhdHVzIiwiZGVjb2RlZCIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwicm9sZSIsImVycm9yIiwiY29uc29sZSIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/check-auth/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcheck-auth%2Froute&page=%2Fapi%2Fadmin%2Fcheck-auth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcheck-auth%2Froute.ts&appDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmusta%5COneDrive%5CBelgeler%5CGitHub%5CKavun&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();