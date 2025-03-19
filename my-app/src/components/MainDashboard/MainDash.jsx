    import React, { useState, useRef, useEffect} from "react";
    import "./MainDash.css"
    import Cards from "../Cards1/Cards1";
    import ThreeModel from "../Threefibermodel/ThreeModel";
    import ChartsOverviewDemo from "../Datadisplay/DataDisplay";
    import api from "../../api.js"
        const MainDash = () => {
            const [activeGate, setActiveGate] = useState(null);
            const [activeAnnotation, setActiveAnnotation] = useState(null)
            const [annotations, setAnnotations] = useState([]);
            const handleGateSelect = (gateData) => {
                setActiveGate(gateData);
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

            const handleAnnotationSelect = (annotationData) => {
                setActiveAnnotation(annotationData);
                console.log(activeAnnotation)
            };

            return (
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
                                
                                        <h3>
                                        "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes
                                        </h3>

                            </div>
                        </div>
                    )}

                        {activeAnnotation && (
                        <div className="fixed-info-widget">
                            <div className="info-widget">
                                <h2>{activeAnnotation.title}</h2>
                                    {/* Specific and explicit check for Scanner annotation */}
                                    {activeAnnotation && 
                                    activeAnnotation.title === "Scanner" && 
                                    activeAnnotation.gateId === "gate3" &&(
                                        <ChartsOverviewDemo />
                                    )}
                                        <h3>
                                        "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes
                                        </h3>
                            </div>
                        </div>
                    )}


                </div>
                
            )

        }

        export default MainDash;