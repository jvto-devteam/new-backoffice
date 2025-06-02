import{r as c,j as e}from"./app-qsN-shIi.js";import{M as x}from"./Main-B1FJdwtV.js";import{C as g}from"./calendar-Dh6acqXy.js";import{U as u}from"./users-BKqGl52y.js";import{T as f}from"./truck-C2Q1PQIV.js";import{P as p}from"./plus-v0AMTvkx.js";import{C as b}from"./check-Bx49bAmk.js";import{T as v}from"./triangle-alert-BeSFQcGN.js";import{c as j}from"./createLucideIcon-LlZgPPfz.js";import{A as w}from"./arrow-right-CUDDlESy.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=j("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]),I=()=>{const[n,s]=c.useState(null),[a,r]=c.useState({}),i=t=>{r(o=>({...o,[t]:!0})),setTimeout(()=>{r(o=>({...o,[t]:!1})),s(t)},1e3)};return e.jsx(x,{children:e.jsx("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900 p-8",children:e.jsxs("div",{className:"space-y-12",children:[e.jsxs("section",{className:"space-y-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white",children:"Interactive Buttons"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(m,{id:"create",label:"Create Booking",icon:g,gradient:"from-blue-500 to-indigo-500",isActive:n==="create",isLoading:a.create,onClick:()=>i("create")}),e.jsx(m,{id:"assign",label:"Assign Resources",icon:u,gradient:"from-purple-500 to-pink-500",isActive:n==="assign",isLoading:a.assign,onClick:()=>i("assign")})]})]}),e.jsxs("section",{className:"space-y-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white",children:"Interactive Cards"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsx(d,{title:"Tour Management",description:"Schedule and manage tours",icon:g,gradient:"from-cyan-500 to-blue-500"}),e.jsx(d,{title:"Resource Planning",description:"Organize guides and vehicles",icon:u,gradient:"from-purple-500 to-pink-500"}),e.jsx(d,{title:"Fleet Management",description:"Monitor vehicle status",icon:f,gradient:"from-emerald-500 to-teal-500"})]})]}),e.jsxs("section",{className:"space-y-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white",children:"State Buttons"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4",children:[e.jsx(l,{label:"Default",icon:p,state:"default"}),e.jsx(l,{label:"Success",icon:b,state:"success"}),e.jsx(l,{label:"Warning",icon:v,state:"warning"}),e.jsx(l,{label:"Loading",icon:h,state:"loading"})]})]})]})})})},m=({id:n,label:s,icon:a,gradient:r,isActive:i,isLoading:t,onClick:o})=>e.jsx("button",{onClick:o,disabled:t,className:`
      relative group
      w-full px-6 py-4 rounded-xl
      bg-gradient-to-r ${r}
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
    `,children:e.jsx("div",{className:"relative flex items-center justify-center space-x-3",children:t?e.jsx(h,{className:"w-5 h-5 text-white animate-spin"}):e.jsxs(e.Fragment,{children:[e.jsx(a,{className:`w-5 h-5 text-white 
            transition-transform duration-300 ease-in-out
            group-hover:scale-110`}),e.jsx("span",{className:"font-medium text-white",children:s}),i&&e.jsx("div",{className:`absolute -right-2 -top-2 w-3 h-3 bg-green-400 rounded-full
              shadow-lg shadow-green-500/50 animate-pulse`})]})})}),d=({title:n,description:s,icon:a,gradient:r})=>{const[i,t]=c.useState(!1);return e.jsxs("div",{onMouseEnter:()=>t(!0),onMouseLeave:()=>t(!1),className:`
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
        bg-gradient-to-r ${r}
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        transform-gpu
        ${i?"scale-110":""}
      `,children:e.jsx(a,{className:`w-6 h-6 text-white
          transition-transform duration-300 ease-in-out
          transform-gpu`})}),e.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-white mt-4",children:n}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400 mt-2",children:s}),e.jsxs("div",{className:`
        mt-4 flex items-center text-gray-500 dark:text-gray-400
        transition-all duration-300 ease-in-out
        ${i?"text-gray-900 dark:text-white translate-x-2":""}
      `,children:[e.jsx("span",{children:"Learn more"}),e.jsx(w,{className:`
          w-4 h-4 ml-2
          transition-all duration-300 ease-in-out
          transform-gpu
          ${i?"translate-x-1":""}
        `})]})]})},l=({label:n,icon:s,state:a})=>{const r={default:"bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",success:"bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30",warning:"bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30",loading:"bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"};return e.jsxs("button",{disabled:a==="loading",className:`
        relative w-full px-4 py-3 rounded-xl
        transition-all duration-300 ease-in-out
        transform-gpu
        ${r[a]}
        
        /* Common Interactive States */
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
        focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
        active:scale-[0.97]
        disabled:opacity-75 disabled:cursor-not-allowed
      `,children:[e.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[a==="loading"?e.jsx(s,{className:"w-5 h-5 animate-spin"}):e.jsx(s,{className:"w-5 h-5"}),e.jsx("span",{children:n})]}),a==="success"&&e.jsx("span",{className:`absolute -right-1 -top-1 w-3 h-3 bg-emerald-400 rounded-full
          animate-pulse`}),a==="warning"&&e.jsx("span",{className:`absolute -right-1 -top-1 w-3 h-3 bg-amber-400 rounded-full
          animate-ping`})]})};export{I as default};
