import{r as a,j as e}from"./app-DvwtVH4G.js";import{M as n}from"./Main-ClqsfnUy.js";import{F as d,i as c,a as s}from"./index-Brbn6hNS.js";const i=`
.fc {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
}

.fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1.5em;
}

.fc .fc-toolbar-title {
    font-size: 1.2rem;
    font-weight: 600;
}

.fc .fc-day-other .fc-daygrid-day-top {
    opacity: 0.5;
}

.fc .fc-button {
    background: transparent;
    border: 1px solid #e5e7eb;
    color: #374151;
    padding: 0.5rem 1rem;
    font-weight: 500;
    border-radius: 0.375rem;
}

.fc .fc-button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #374151;
}

.fc .fc-daygrid-day-frame {
    min-height: 100px;
}

.fc .fc-col-header-cell {
    background: #f9fafb;
    padding: 0.75rem;
}

.fc .fc-col-header-cell-cushion {
    color: #4b5563;
    font-weight: 500;
    text-decoration: none;
}

.fc .fc-daygrid-day.fc-day-today {
    background: #eff6ff;
}

.event-booking {
    background-color: #fee0e0 !important;
    border-left: 3px solid #ef4444 !important;
    margin: 2px 0;
}

.event-crew {
    background-color: #dbeafe !important;
    border-left: 3px solid #3b82f6 !important;
    margin: 2px 0;
}

.event-transport {
    background-color: #fef3c7 !important;
    border-left: 3px solid #f59e0b !important;
    margin: 2px 0;
}

.fc-event {
    border: none !important;
    background: transparent;
    padding: 2px;
}

.fc-h-event {
    padding: 2px;
}

.fc-daygrid-event {
    border-radius: 0;
    padding: 2px 4px;
}
`,r={jvto:"https://javavolcano-touroperator.com/assets/img/jvto-color.png?1702429896",klook:"https://d36rd0l160k43h.cloudfront.net/43e4095a7ae79ed99c91e03767e505e1/7275fa5cc37e251508b0f4ec95d3115e/Logo_rgb.png"},l=[{id:1,title:"James Johnson",start:"2024-12-01",end:"2024-12-05",classNames:["event-booking"],extendedProps:{type:"booking",avatar:"J",platform:"jvto"}},{id:2,title:"Robert Garcia",start:"2024-12-06",end:"2024-12-09",classNames:["event-crew"],extendedProps:{type:"crew",avatar:"R",platform:"klook"}},{id:3,title:"Michael Brown",start:"2024-12-09",end:"2024-12-11",classNames:["event-transport"],extendedProps:{type:"transport",avatar:"M",platform:"jvto"}},{id:4,title:"David Martinez",start:"2024-12-19",end:"2024-12-22",classNames:["event-crew"],extendedProps:{type:"crew",avatar:"D",platform:"klook"}}],f=t=>{const o=t.event.extendedProps.platform==="klook"?r.klook:r.jvto;return e.jsxs("div",{className:"flex items-center gap-2 px-1",children:[e.jsx("div",{className:"w-5 h-5 shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center",children:e.jsx("img",{src:o,alt:"Platform logo",className:"w-4 h-4 object-contain"})}),e.jsx("span",{className:"text-sm font-medium text-gray-700 truncate",children:t.event.title})]})},g=()=>{const t=a.useRef(null);return e.jsx(n,{children:e.jsxs("div",{className:"min-h-screen p-6",children:[e.jsx("style",{children:i}),e.jsx("div",{className:"mb-6",children:e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Calendar Management"})}),e.jsx(d,{ref:t,plugins:[c,s],initialView:"dayGridMonth",events:l,eventContent:f,headerToolbar:{left:"prev,next today",center:"title",right:""},dayMaxEvents:!0,firstDay:1,height:"auto",views:{dayGrid:{dayMaxEvents:3}}})]})})};export{g as default};
