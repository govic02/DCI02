import { useVisibility } from '../context/VisibilityContext.js';

class HandleSelectionExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
        this._button2 = null;
        this._data = null;
    }

    load() {
        console.log('HandleSelectionExtension has been loaded');
        return true;
    }

    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log('HandleSelectionExtension has been unloaded');
        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }
        window.toggleTabVisibility = () => {
            const { toggleVisibility } = useVisibility(); // Esto puede no funcionar directamente ya que useVisibility necesita un componente de React
            toggleVisibility();
        };
        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('handleSelectionExtensionButton');
        this._gestorVistasButton = new Autodesk.Viewing.UI.Button('gestorVistasButton');
        this._button2 = new Autodesk.Viewing.UI.Button('botonPaleta');
       
       
        this._button2.onClick = (ev) => {
            // Lógica para alternar la visibilidad de los elementos seleccionados
            const selection = this.viewer.getSelection();
            console.log("detecto click");
            window.dispatchEvent(new CustomEvent('toggleTabVisibilityPaleta'));
        };


        this._button2.setToolTip('Fechas&Propiedades');
        let iconPathP = "images/calen.png";  // Actualiza con la ruta real a tu ícono
        this._button2.icon.style = `background-image: url(${iconPathP}); background-size: cover;`;
        this._group.addControl(this._button2);

        this._button.onClick = (ev) => {
           console.log("detecto click");
           window.dispatchEvent(new CustomEvent('toggleTabVisibility'));
      
            const selection = this.viewer.getSelection();
           // this.viewer.clearSelection();
            // Anything selected?
            if (selection.length > 0) {
                let isolated = [];
                // Iterate through the list of selected dbIds
                selection.forEach((dbId) => {
                    // Get properties of each dbId
                    this.viewer.getProperties(dbId, (props) => {
                        // Output properties to console
                        console.log(props);
                        // Ask if want to isolate
/*                         if (confirm(`Isolate ${props.name} (${props.externalId})?`)) {
                            isolated.push(dbId);
                            this.viewer.isolate(isolated);
                        } */
                        isolated.push(dbId);
                        this.viewer.isolate(isolated);
                    });
                });
            } else {
                // If nothing selected, restore
                this.viewer.isolate(0);
            }
        };

        this._gestorVistasButton.onClick = (ev) => {
            // Aquí puedes agregar la lógica que se ejecutará cuando se haga clic en el botón
            console.log('Botón gestorVistas pulsado');
            window.dispatchEvent(new CustomEvent('toggleTabVisibilityVistas'));
        };

        
        this._button.setToolTip('Funciones ICD');
        this._gestorVistasButton.setToolTip('Gestor de Vistas');
        let iconPath = "images/isotipoTransparente.png";
        this._button.icon.style = `background-image: url(${iconPath}); background-size: 22px 22px;`;
        let iconPathGestorVistas = "images/eyered.svg"; // Reemplaza con la ruta de tu icono
        this._gestorVistasButton.icon.style = `background-image: url(${iconPathGestorVistas}); background-size: 22px 22px;`;

        
        
      
       // this._button.classList.add("fas", "fa-arrows-alt");
       
     //   this._button.addClass('handleSelectionExtensionIcon');
        this._group.addControl(this._button);
        this._group.addControl(this._gestorVistasButton);
    
      //  this._button2.setToolTip('atBIM Button');
       // this._button2.addClass('handleSelectionExtensionIcon');
        //this._group.addControl(this._button2);
    }

    drawData() {
        let _this = this;
        console.log(this._data);
        var div = document.getElementById('atbimPanel');
        div.innerHTML = '<canvas id="myChart" width="400" height="400"></canvas>';
        var ctx = document.getElementById('myChart').getContext('2d');
        let keys = Object.keys(this._data);
        let values = Object.values(this._data).map(x => x.cantidad);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: keys,
                datasets: [{
                    label: 'Cantidad',
                    data: values,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                'onClick': function(evento, item) {
                 
                    if (item[0] !== undefined) {
                        let label = item[0]._model.label;
                        let dbIds = _this._data[label].dbIds;                        
                        _this.viewer.isolate(dbIds);
                        _this.viewer.fitToView(dbIds, _this.viewer.model);
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('HandleSelectionExtension', HandleSelectionExtension);
