export const SidebarData =[

{Heading: 'Digital Twin'},
{Heading: 'Key statistics'},


]

export const CardsData = [
    { title: "Number of Red/month", content: 12, colour:"#FF6961" },
    { title: "Number of Yellow/month", content: 3,colour:"#FFB54C" },
    { title: "Number of Green/month", content: 6,colour:"#8CD47E" },

];


export const AnnotationPointData =[

    {
    
    Rendering:{
        position: [0.8, 1.15, 1.2],
        widgetposition: [0.8, 1.15, 1.2],
        title: "Point A",
        description: "Primary monitoring point with real-time data collection",
        color1: 0xff8888,
        color2: 0xff0000,
        cameraView: {
          position: [2,2, 0],
          lookAt: [0.8, 1.15, 0.3],
          zoom: 8
        }
    },
    title: "Scanner", 
    gateId: "gate1",
    content:{
        Health:"79%",
        ScanningTime:12,
        ProccessingTime: 21
    }
},
{
    
    Rendering:{
        position: [-0.5, 0.7, -1.2],
      title: "Point B",
      description: "Secondary checkpoint with environmental sensors",
      color1: 0xCDD839,
      color2: 0xA2AD14,
      cameraView: {
        position: [0.4, 1.2, 0],
        lookAt: [-0.3, 0.7, -1.2],
        zoom: 9
        }
    },
    title: "Rear Gate 1", 
    gateId: "gate1",
    content:{
        Health:"69%",
        OpeningTime: 10,
    }
},

{
    Rendering:{
        position: [0.5, 0.7, -1.2],
      title: "Point B",
      description: "Secondary checkpoint with environmental sensors",
      color1: 0xFFD066,
      color2: 0xFFBB22,
      cameraView: {
        position: [0.2, 1.2, 0],
        lookAt: [0.7, 0.7, -1.2],
        zoom: 8
        }
    },
    title: "Rear Gate 2", 
    gateId: "gate1",
    content:{
        Health:"69%",
        OpeningTime: 10,
    }
},
{
   
    Rendering:{
        position: [-2.2, 1.15, 1.2],
        widgetposition: [0.8, 1.15, 1.2],
        title: "Point A",
        description: "Primary monitoring point with real-time data collection",
        color1: 0xFFD066,
        color2: 0xFFBB22,
        cameraView: {
          position: [0, 2, 0],
          lookAt: [-2.2, 1.15, 0.3],
          zoom: 8
        }
    },
    title: "Scanner", 
    gateId: "gate2",
    content:{
        Health:"35%",
        ScanningTime:34,
        ProccessingTime: 21
    }
},

{
   
    Rendering:{
        position: [-1, 0.7, 1.2],
        widgetposition: [0.8, 1.15, 1.2],
        title: "Point A",
        description: "Primary monitoring point with real-time data collection",
        color1: 0xFFD066,
        color2: 0xFFBB22,
        cameraView: {
            position:[-0.8, 2, 5],
            lookAt: [-0.8, 0.7, 1.2],
            zoom: 10
        }
    },
    title: "Front Gate 2", 
    gateId: "gate2",
    content:{
        Health:"45%",
        ScanningTime:70,
        ProccessingTime: 21
    }
},

]





export const GatePointData =[

    {
        gatePosition: [0.2, 0.5, 3],
        gateTitle: "gate1",
        color1: 0xff8888,
        color2: 0xff0000,
        cameraView: {
          position: [3, 3, 5],
          lookAt: [0, 0, 0],
          zoom: 3
        }
      },
      {
        gatePosition: [-1.5, 0.5, 3],
        gateTitle: "gate2",
        color1: 0xff8888,
        color2: 0xff0000,
        cameraView: {
          position: [1.5, 3, 5],
          lookAt: [-1.5, 0, 0],
          zoom: 3
        }
      },
      {
        gatePosition: [-3, 0.5, 3],
        gateTitle: "gate3",
        color1: 0xFFD066,
      color2: 0xFFBB22,
        cameraView: {
          position: [0, 3, 5],
          lookAt: [-3, 0, 0],
          zoom: 3
        }
      },
      {
        gatePosition: [1.5, 0.5, 3],
        gateTitle: "gate4",
        color1: 0xFFD066,
        color2: 0xFFBB22,
        cameraView: {
          position: [4.5, 3, 5],
          lookAt: [1.5, 0, 0],
          zoom: 3
        }
      },
      {
        gatePosition: [3, 0.5, 3],
        gateTitle: "gate5",
        color1: 0xCDD839,
        color2: 0xA2AD14,
        cameraView: {
          position: [6, 3, 5],
          lookAt: [3, 0, 0],
          zoom: 3
        }
      },



]
