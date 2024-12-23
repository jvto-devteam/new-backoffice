import{r as g,j as e}from"./app-RpEQBROI.js";import{M as p}from"./Main-Cvv5tbI4.js";import{c as d}from"./createLucideIcon-DmjsEbMQ.js";import{U as h}from"./users-B8u0v74W.js";import{P as b}from"./plus-cGRN92vN.js";import{C as f}from"./check-pnMGk-M2.js";import{A as y}from"./arrow-right-Dw8kH-Qs.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=d("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=d("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=d("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=d("Truck",[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]]),L=()=>{const[n,r]=g.useState(null),[a,s]=g.useState({}),i=t=>{s(o=>({...o,[t]:!0})),setTimeout(()=>{s(o=>({...o,[t]:!1})),r(t)},1e3)};return e.jsx(p,{children:e.jsx("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900 p-8",children:e.jsxs("div",{className:"space-y-12",children:[e.jsxs("section",{className:"space-y-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white",children:"Interactive Buttons"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(m,{id:"create",label:"Create Booking",icon:u,gradient:"from-blue-500 to-indigo-500",isActive:n==="create",isLoading:a.create,onClick:()=>i("create")}),e.jsx(m,{id:"assign",label:"Assign Resources",icon:h,gradient:"from-purple-500 to-pink-500",isActive:n==="assign",isLoading:a.assign,onClick:()=>i("assign")})]})]}),e.jsxs("section",{className:"space-y-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white",children:"Interactive Cards"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsx(c,{title:"Tour Management",description:"Schedule and manage tours",icon:u,gradient:"from-cyan-500 to-blue-500"}),e.jsx(c,{title:"Resource Planning",description:"Organize guides and vehicles",icon:h,gradient:"from-purple-500 to-pink-500"}),e.jsx(c,{title:"Fleet Management",description:"Monitor vehicle status",icon:j,gradient:"from-emerald-500 to-teal-500"})]})]}),e.jsxs("section",{className:"space-y-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white",children:"State Buttons"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4",children:[e.jsx(l,{label:"Default",icon:b,state:"default"}),e.jsx(l,{label:"Success",icon:f,state:"success"}),e.jsx(l,{label:"Warning",icon:v,state:"warning"}),e.jsx(l,{label:"Loading",icon:x,state:"loading"})]})]})]})})})},m=({id:n,label:r,icon:a,gradient:s,isActive:i,isLoading:t,onClick:o})=>e.jsx("button",{onClick:o,disabled:t,className:`
      relative group
      w-full px-6 py-4 rounded-xl
      bg-gradient-to-r ${s}
      transition-all duration-300 ease-in-out
      transform-gpu
      
      /* Hover Effects */
      hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
      hover:translate-y-[-2px]
      hover:opacity-90
      
      /* Focus Effects */
      focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
      focus:scale-[0.98]
      
      /* Active Effects */
      active:scale-[0.97]
      
      /* Disabled State */
      disabled:opacity-75 disabled:cursor-not-allowed
      disabled:hover:translate-y-0
    `,children:e.jsx("div",{className:"relative flex items-center justify-center space-x-3",children:t?e.jsx(x,{className:"w-5 h-5 text-white animate-spin"}):e.jsxs(e.Fragment,{children:[e.jsx(a,{className:`w-5 h-5 text-white \r
            transition-transform duration-300 ease-in-out\r
            group-hover:scale-110`}),e.jsx("span",{className:"font-medium text-white",children:r}),i&&e.jsx("div",{className:`absolute -right-2 -top-2 w-3 h-3 bg-green-400 rounded-full\r
              shadow-lg shadow-green-500/50 animate-pulse`})]})})}),c=({title:n,description:r,icon:a,gradient:s})=>{const[i,t]=g.useState(!1);return e.jsxs("div",{onMouseEnter:()=>t(!0),onMouseLeave:()=>t(!1),className:`
        relative p-6 rounded-xl
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        transform-gpu
        
        /* Hover Effects */
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
        hover:border-gray-300 dark:hover:border-gray-600
        hover:translate-y-[-4px]
        
        /* Interactive States */
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
      `,children:[e.jsx("div",{className:`
        w-12 h-12 rounded-xl
        bg-gradient-to-r ${s}
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        transform-gpu
        ${i?"scale-110":""}
      `,children:e.jsx(a,{className:`w-6 h-6 text-white\r
          transition-transform duration-300 ease-in-out\r
          transform-gpu`})}),e.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-white mt-4",children:n}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400 mt-2",children:r}),e.jsxs("div",{className:`
        mt-4 flex items-center text-gray-500 dark:text-gray-400
        transition-all duration-300 ease-in-out
        ${i?"text-gray-900 dark:text-white translate-x-2":""}
      `,children:[e.jsx("span",{children:"Learn more"}),e.jsx(y,{className:`
          w-4 h-4 ml-2
          transition-all duration-300 ease-in-out
          transform-gpu
          ${i?"translate-x-1":""}
        `})]})]})},l=({label:n,icon:r,state:a})=>{const s={default:"bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",success:"bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30",warning:"bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30",loading:"bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"};return e.jsxs("button",{disabled:a==="loading",className:`
        relative w-full px-4 py-3 rounded-xl
        transition-all duration-300 ease-in-out
        transform-gpu
        ${s[a]}
        
        /* Common Interactive States */
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
        focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
        active:scale-[0.97]
        disabled:opacity-75 disabled:cursor-not-allowed
      `,children:[e.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[a==="loading"?e.jsx(r,{className:"w-5 h-5 animate-spin"}):e.jsx(r,{className:"w-5 h-5"}),e.jsx("span",{children:n})]}),a==="success"&&e.jsx("span",{className:`absolute -right-1 -top-1 w-3 h-3 bg-emerald-400 rounded-full\r
          animate-pulse`}),a==="warning"&&e.jsx("span",{className:`absolute -right-1 -top-1 w-3 h-3 bg-amber-400 rounded-full\r
          animate-ping`})]})};export{L as default};
