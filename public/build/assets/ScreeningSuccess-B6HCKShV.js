import{r,j as e}from"./app-qsN-shIi.js";import{L as v,S as w}from"./stethoscope-DwCTEMAg.js";import{A as S}from"./arrow-left-CpSPlUdd.js";import{C as o}from"./circle-check-big-CK-9MS_0.js";import{C as P}from"./circle-alert-BbPz3Yad.js";import{U as R}from"./user-CAmda06J.js";import{H as k,T as z}from"./thermometer-DGjFwCon.js";import{H as A,D as I}from"./heart-pulse-0Eic4WCU.js";import{I as $}from"./info-C0CdYC_M.js";import"./createLucideIcon-LlZgPPfz.js";const Y=()=>{const[x,h]=r.useState(!0),[l,g]=r.useState(""),[u,p]=r.useState(!1),[f,d]=r.useState(!1),[s,b]=r.useState(null),[c,m]=r.useState(null);r.useEffect(()=>{const i=new URLSearchParams(window.location.search).get("id")||"IJN230515001";setTimeout(()=>{b({id:i,name:"Arif Hassan",age:35,gender:"Male",examDate:"May 15, 2023",examTime:"05:10 AM",location:"Paltuding Entry Point",status:"Approved",vitalSigns:{bloodPressure:{systolic:120,diastolic:80},heartRate:72,temperature:36.5,respirationRate:16,oxygenSaturation:98},recommendations:"Healthy. Approved for hiking.",doctor:"Dr. Maya Wijaya"}),h(!1)},1500)},[]);const j=a=>{a.preventDefault(),l==="1234"||l==="0505"?(p(!0),setTimeout(()=>{d(!0),setTimeout(()=>{d(!1)},4e3)},500)):m("Incorrect password. Please try again.")},t=(a,i)=>{const n={systolic:[90,120],diastolic:[60,80],heartRate:[60,100],temperature:[36.1,37.2],respirationRate:[12,20],oxygenSaturation:[95,100]};if(n[a]){const[y,N]=n[a];return i>=y&&i<=N}return!0};return x?e.jsxs("div",{className:"min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6",children:[e.jsx("div",{className:"w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-6"}),e.jsx("h2",{className:"text-xl font-bold text-gray-800 mb-2",children:"Loading Results"}),e.jsx("p",{className:"text-gray-600 text-center",children:"Please wait while we fetch your examination results..."})]}):u?e.jsxs("div",{className:"min-h-screen bg-gray-50 pb-20 relative overflow-hidden",children:[f&&e.jsxs("div",{className:"absolute inset-0 z-30 pointer-events-none",children:[e.jsx("div",{className:"confetti-container",children:[...Array(50)].map((a,i)=>e.jsx("div",{className:"confetti",style:{left:`${Math.random()*100}%`,top:"-10%",width:`${Math.random()*10+5}px`,height:`${Math.random()*10+5}px`,backgroundColor:["#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff"][Math.floor(Math.random()*6)],animation:`fall ${Math.random()*3+2}s linear forwards, sway ${Math.random()*4+2}s ease-in-out infinite alternate`}},i))}),e.jsx("div",{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",children:e.jsx("div",{className:"celebration-circle"})})]}),e.jsxs("div",{className:"bg-white p-4 flex items-center shadow-sm",children:[e.jsx("button",{onClick:()=>window.history.back(),className:"mr-2",children:e.jsx(S,{size:24,className:"text-gray-800"})}),e.jsx("h1",{className:"text-xl font-bold text-gray-800 flex-1 text-center",children:"Health Examination Results"})]}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:`rounded-xl overflow-hidden shadow-md mb-6 ${s.status==="Approved"?"bg-green-500":"bg-red-500"}`,children:[e.jsxs("div",{className:"flex items-center p-4",children:[e.jsx("div",{className:"bg-white rounded-full p-2 mr-3",children:s.status==="Approved"?e.jsx(o,{size:24,className:"text-green-500"}):e.jsx(P,{size:24,className:"text-red-500"})}),e.jsxs("div",{className:"text-white",children:[e.jsx("h2",{className:"font-bold",children:s.status==="Approved"?"Approved for Ijen Trek":"Not Approved"}),e.jsxs("p",{className:"text-sm opacity-90",children:["Health check completed on ",s.examDate]})]})]}),e.jsx("div",{className:"bg-black bg-opacity-20 p-2 text-center text-white text-sm",children:"Please show this screen or your wristband at the entrance checkpoint"})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100",children:[e.jsx("h2",{className:"font-bold text-lg text-gray-800 mb-3",children:"Patient Information"}),e.jsxs("div",{className:"flex items-center mb-4",children:[e.jsx("div",{className:"w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4",children:e.jsx(R,{size:32,className:"text-blue-500"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-lg text-gray-800",children:s.name}),e.jsxs("p",{className:"text-gray-600",children:[s.age," years • ",s.gender]}),e.jsx("div",{className:"mt-1",children:e.jsxs("span",{className:"bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full",children:["ID: ",s.id]})})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 mb-4",children:[e.jsxs("div",{className:"p-3 bg-gray-50 rounded-lg",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Examination Date"}),e.jsx("p",{className:"font-medium text-gray-800",children:s.examDate})]}),e.jsxs("div",{className:"p-3 bg-gray-50 rounded-lg",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Examination Time"}),e.jsx("p",{className:"font-medium text-gray-800",children:s.examTime})]}),e.jsxs("div",{className:"p-3 bg-gray-50 rounded-lg",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Location"}),e.jsx("p",{className:"font-medium text-gray-800",children:s.location})]}),e.jsxs("div",{className:"p-3 bg-gray-50 rounded-lg",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Examined By"}),e.jsx("p",{className:"font-medium text-gray-800",children:s.doctor})]})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100",children:[e.jsx("h2",{className:"font-bold text-lg text-gray-800 mb-3",children:"Vital Signs"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 mb-4",children:[e.jsxs("div",{className:`p-3 rounded-lg flex justify-between items-center ${t("systolic",s.vitalSigns.bloodPressure.systolic)&&t("diastolic",s.vitalSigns.bloodPressure.diastolic)?"bg-green-50":"bg-red-50"}`,children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-600",children:"Blood Pressure"}),e.jsxs("p",{className:"font-medium text-gray-800",children:[s.vitalSigns.bloodPressure.systolic,"/",s.vitalSigns.bloodPressure.diastolic," mmHg"]})]}),e.jsx(k,{size:20,className:`${t("systolic",s.vitalSigns.bloodPressure.systolic)&&t("diastolic",s.vitalSigns.bloodPressure.diastolic)?"text-green-500":"text-red-500"}`})]}),e.jsxs("div",{className:`p-3 rounded-lg flex justify-between items-center ${t("heartRate",s.vitalSigns.heartRate)?"bg-green-50":"bg-red-50"}`,children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-600",children:"Heart Rate"}),e.jsxs("p",{className:"font-medium text-gray-800",children:[s.vitalSigns.heartRate," bpm"]})]}),e.jsx(A,{size:20,className:`${t("heartRate",s.vitalSigns.heartRate)?"text-green-500":"text-red-500"}`})]}),e.jsxs("div",{className:`p-3 rounded-lg flex justify-between items-center ${t("temperature",s.vitalSigns.temperature)?"bg-green-50":"bg-red-50"}`,children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-600",children:"Temperature"}),e.jsxs("p",{className:"font-medium text-gray-800",children:[s.vitalSigns.temperature,"°C"]})]}),e.jsx(z,{size:20,className:`${t("temperature",s.vitalSigns.temperature)?"text-green-500":"text-red-500"}`})]}),e.jsxs("div",{className:`p-3 rounded-lg flex justify-between items-center ${t("respirationRate",s.vitalSigns.respirationRate)?"bg-green-50":"bg-red-50"}`,children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-600",children:"Respiration"}),e.jsxs("p",{className:"font-medium text-gray-800",children:[s.vitalSigns.respirationRate," br/min"]})]}),e.jsx(w,{size:20,className:`${t("respirationRate",s.vitalSigns.respirationRate)?"text-green-500":"text-red-500"}`})]}),e.jsxs("div",{className:`p-3 rounded-lg flex justify-between items-center col-span-2 ${t("oxygenSaturation",s.vitalSigns.oxygenSaturation)?"bg-green-50":"bg-red-50"}`,children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-600",children:"Oxygen Saturation"}),e.jsxs("p",{className:"font-medium text-gray-800",children:[s.vitalSigns.oxygenSaturation,"%"]})]}),e.jsx(I,{size:20,className:`${t("oxygenSaturation",s.vitalSigns.oxygenSaturation)?"text-green-500":"text-red-500"}`})]})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100",children:[e.jsx("h2",{className:"font-bold text-lg text-gray-800 mb-3",children:"Recommendations"}),e.jsx("div",{className:"p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4",children:e.jsx("p",{className:"text-gray-800",children:s.recommendations})}),s.status==="Approved"&&e.jsxs("div",{className:"p-4 bg-green-50 rounded-lg border border-green-100 flex items-start",children:[e.jsx(o,{size:20,className:"text-green-500 mr-3 mt-0.5 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-green-800",children:"Ready for Ijen Crater Trek"}),e.jsx("p",{className:"text-green-700 text-sm",children:"Your health screening has been approved. Please keep your wristband on throughout your journey."})]})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100",children:[e.jsx("h2",{className:"font-bold text-lg text-gray-800 mb-3",children:"Validity Information"}),e.jsxs("div",{className:"flex items-start mb-4",children:[e.jsx("div",{className:"bg-yellow-100 p-2 rounded-full mr-3 flex-shrink-0",children:e.jsx($,{size:16,className:"text-yellow-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-800",children:"Valid for 72 Hours"}),e.jsxs("p",{className:"text-sm text-gray-600",children:["This health verification expires on ",s.examDate," at ",s.examTime]})]})]}),e.jsxs("div",{className:"flex items-start",children:[e.jsx("div",{className:"bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0",children:e.jsx(o,{size:16,className:"text-blue-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-800",children:"Verification"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Entry checkpoint staff will verify this health pass by scanning your wristband QR code."})]})]})]}),e.jsxs("div",{className:"bg-gray-100 rounded-xl p-4 text-center",children:[e.jsx("p",{className:"text-sm text-gray-700 mb-2",children:"Need assistance?"}),e.jsxs("p",{className:"text-xs text-gray-500",children:["If you need help or have questions, please contact Ijen Health Support",e.jsx("br",{}),e.jsx("span",{className:"text-blue-600 font-medium",children:"support@ijenhealth.id"})," or call ",e.jsx("span",{className:"text-blue-600 font-medium",children:"+62 812 3456 7890"})]})]})]}),e.jsx("style",{jsx:!0,children:`
        @keyframes fall {
          0% {
            top: -10%;
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            top: 100%;
            transform: translateY(1000px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes sway {
          0% {
            margin-left: -30px;
          }
          100% {
            margin-left: 30px;
          }
        }
        
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          z-index: 1;
          border-radius: 3px;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(50);
            opacity: 0;
          }
        }
        
        .celebration-circle {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(74,222,128,0.8) 0%, rgba(52,211,153,0.4) 70%, rgba(52,211,153,0) 100%);
          border-radius: 50%;
          animation: pulse 2s ease-out;
        }
        
        @keyframes zoom {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .zoom-in-out {
          animation: zoom 1.5s ease-out forwards;
        }
      `})]}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-6",children:[e.jsxs("div",{className:"max-w-md w-full bg-white rounded-xl shadow-lg p-6",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx("div",{className:"bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",children:e.jsx(v,{size:32,className:"text-blue-600"})}),e.jsx("h2",{className:"text-xl font-bold text-gray-800",children:"Health Check Results"}),e.jsx("p",{className:"text-gray-600 mt-1",children:"Please enter the password to view your results"})]}),e.jsxs("form",{onSubmit:j,children:[e.jsxs("div",{className:"mb-4",children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:["Password",e.jsx("span",{className:"text-xs text-gray-500 ml-1",children:"(Birth date DDMM or provided code)"})]}),e.jsx("input",{type:"password",value:l,onChange:a=>{g(a.target.value),m(null)},className:"w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-wider",placeholder:"••••",maxLength:4}),c&&e.jsx("p",{className:"text-red-500 text-sm mt-1",children:c})]}),e.jsx("button",{type:"submit",className:"w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors",children:"View Results"})]}),e.jsx("div",{className:"mt-6 text-center",children:e.jsxs("p",{className:"text-xs text-gray-500",children:["Having trouble? Please contact the medical staff or call",e.jsx("br",{}),e.jsx("span",{className:"text-blue-600 font-medium",children:"+62 812 3456 7890"})]})})]}),e.jsx("div",{className:"mt-8 text-center text-white text-opacity-70 text-sm",children:e.jsx("p",{children:"© Copyright Health Screening Verification Portal"})})]})};export{Y as default};
