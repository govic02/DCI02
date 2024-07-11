import React, { useEffect, useRef } from 'react';

const VisualizadorDev = () => {
    const viewerDivRef = useRef(null);

    useEffect(() => {
      
      const onDocumentLoadSuccess = (doc) => {
        const rootItem = doc.getRoot();
        const viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, { type: 'geometry' }, true);
        if (viewables.length === 0) {
          console.error('Documento cargado no contiene contenido visualizable.');
          return;
        }
        const initialViewable = viewables[0];
        const svfUrl = doc.getViewablePath(initialViewable);
        const modelOptions = {
          sharedPropertyDbPath: doc.getPropertyDbPath()
        };
        viewerDivRef.current.loadModel(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
      };
  
      const onDocumentLoadFailure = () => {
        console.error('Error al cargar el documento.');
      };
  
      const onLoadModelSuccess = (model) => {
      //console.log("Modelo cargado exitosamente:", model);
      };
  
      const onLoadModelError = (error) => {
        console.error("Error al cargar el modelo:", error);
      };
  
      Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken: token }, () => {
        const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDivRef.current);
        viewer.start();
        const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtY29kZXBlbi1tb2RlbHMvcmFjLWJhc2ljLXNhbXBsZS1wcm9qZWN0LnJ2dA';
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
      });
  
      // Limpiar al desmontar el componente
      return () => {
        if (viewer) {
          viewer.finish();
        }
      };
    }, []);
  
    return <div ref={viewerDivRef} style={{ width: '100%', height: '100vh' }}></div>;
  };
  
  
export default VisualizadorDev;
