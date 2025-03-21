    import React, { useState, useRef, useEffect,Suspense} from "react";
    import "./MainDash.css"
    import Cards from "../Cards1/Cards1";
    import ThreeModel from "../Threefibermodel/ThreeModel";
    import api from "../../api.js"

    import { WebSocketProvider } from '../WebSocketContext/Websocket';

        const MainDash = () => {
            const [activeGate, setActiveGate] = useState(null);
            const [activeAnnotation, setActiveAnnotation] = useState(null)
            const [annotations, setAnnotations] = useState([]);
            const componentMap = {
                'gate3_Scanner': React.lazy(() => import('../Datadisplay/DataDisplay')),
              
              };
            const componentGateMap = {
                'gate3': React.lazy(()=> import('../FrontGateDisplay/GateDisplay')),
              };

            const handleGateSelect = (gateData) => {
                setActiveGate(gateData);
            };

            const handleAnnotationSelect = (annotationData) => {
                setActiveAnnotation(annotationData);
                console.log(activeAnnotation)
            };
            
            const[gates,setGates] = useState([])
            const [isLoading, setIsLoading] = useState(true);
            const [error, setError] = useState(null);
            const debugLog = (message, data) => {
                console.log(`[Debug] ${message}:`, data);
            };
            const fetchAnnotationPointData = async () => {
                try {
                setIsLoading(true);
                const annotationresponse = await api.get('/api/annotationdata');
                const gateresponse = await api.get('/api/gatedata');
                debugLog('Raw API Response', gateresponse.data);
                const transformedGateData = gateresponse.data.gate_points.map(item => ({
                    gatePosition: item.gatePosition,
                    gateTitle: item.gateTitle,
                    gateId: item.gateId,
                    color1: item.color1,
                    color2: item.color2,
                    cameraView: item.cameraView,
                }));
                
                // Transform backend data to match frontend structure
                const transformedAnnotationData = annotationresponse.data.annotation_points.map(item => ({
                    position: item.Rendering.position,
                    widgetposition: item.Rendering.widgetposition,
                    title: item.title,
                    gateId: item.gateId,
                    description: item.Rendering.description,
                    color1: item.Rendering.color1,
                    color2: item.Rendering.color2,
                    cameraView: item.Rendering.cameraView,
                    contentTitle: item.title,
                    content: item.content
                }));
                debugLog('data', transformedAnnotationData)
                setAnnotations(transformedAnnotationData);
                setGates(transformedGateData);
                setError(null);
                } catch (error) {
                console.error("Error fetching annotation points:", error);
                setError("Failed to load annotation data");
                } finally {
                setIsLoading(false);
                }
            };
            
            // Fetch data when component mounts
            
            useEffect(() => {
                fetchAnnotationPointData();
            }, []);

            
            const getComponentForAnnotation = (annotation) => {
                // You could have more complex logic here
                // Like checking permissions, feature flags, etc.
                if (!annotation) return null;
                
                const compositeKey = `${annotation.gateId}_${annotation.title}`;
                return componentMap[compositeKey] || null;
              };


            const getComponentForGate = (gate) => {
                // You could have more complex logic here
                // Like checking permissions, feature flags, etc.
                if (!gate) return null;
                
                const compositeGateKey = `${gate.gateTitle}`;
                return componentGateMap[compositeGateKey] || null;
              };

            return (

                <WebSocketProvider>
                <div className="MainDash">
                    <div className="topbar">
                        <Cards/>
                    </div>

                    <div className="BorderViewbox">
                        <ThreeModel 
                        onGateSelect = {handleGateSelect} 
                        onAnnotationSelect = {handleAnnotationSelect}
                        annotations={annotations} //pass down annotation data api
                        gates= {gates} // pass down gate data api
                        fetchAnnotationPointData={fetchAnnotationPointData} //reset button function call
                        />
                    </div>
                    
                    {activeGate && !activeAnnotation && (
                        <div className="fixed-info-widget">
                            <div className="info-widget">
                                <h2>{activeGate.gateTitle}</h2>
                                    {/* Dynamic component (gate) rendering with Suspense */}
                                    {(() => {
                                        const DynamicGateComponent = getComponentForGate(activeGate);
                                        console.log(DynamicGateComponent)
                                        return DynamicGateComponent ? (
                                            <Suspense fallback={<div>Loading component...</div>}>
                                                <DynamicGateComponent/>
                                            </Suspense>
                                        ) : null;
                                    })()}

                                   
                            </div>
                        </div>
                    )}

                        {activeAnnotation && (
                        <div className="fixed-info-widget">
                            <div className="info-widget">
                                <h2>
                                    {activeAnnotation.title}
                                </h2>
                                    {/* Dynamic component (annotation) rendering with Suspense */}
                                    {(() => {
                                        const DynamicAnnotationComponent = getComponentForAnnotation(activeAnnotation);
                                        console.log(DynamicAnnotationComponent)
                                        return DynamicAnnotationComponent ? (
                                            <Suspense fallback={<div>Loading component...</div>}>
                                                <DynamicAnnotationComponent />
                                            </Suspense>
                                        ) : null;
                                    })()}
                                        
                            </div>
                        </div>
                    )}


                </div>
                </WebSocketProvider>
            )

        }

        export default MainDash;