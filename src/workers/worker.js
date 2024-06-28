self.onmessage = function(e) {
    const data = e.data;
    // Procesa los datos recibidos y responde
    const result = processData(data);
    self.postMessage({ result: result });
};

function processData(data) {
    // Ejemplo de procesamiento de datos
    return `Processed ${data}`;
}
