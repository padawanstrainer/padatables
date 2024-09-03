# PadaTables
Script para crear tablas paginadas, con buscador y ordenar columnas, ya sea scanneando las filas de un `Table` en el HTML o ejecutando un PHP vía ajax/fetch.

## MODO DE USO

Importar el Javascript ubicado en `src/padatables.js` y el css ubicado en `src/padatables.css`

Instanciar un objeto de la clase PadaTables que recibe dos argumentos.  
1. Un selector CSS para indicar la Tabla a afectar (default: `.padatables` )
2. Un object de configuración que se explica en detalle más adelante.

Ejecutar el método `render( )` del PadaTables para aplicar el funcionamiento

```js
const padatables = new PadaTables( '.padatables', {  } );
padatables.render( );
```

### SOBRE TABLA HTML 
El funcionamiento de PadaTables es por medio de _custom-attributes_ (los atributos _data-algo_ de HTML) en los encabezados de la tabla (las etiquetas `<th>` )

* `data-sort`: Indica que esa columna puede ser ordenable al hacer click en la celda encabezado (th).
* `data-type`: El en caso de la tabla HTML indica el tipo de dato que corresponde con esa columna, por default es `str`. Acepta `int` para valores numéricos sin decimal, `float` para valores numéricos con decimal y `date` para columnas de tipo fecha/fecha-hora. Este atributo no tiene castorización en las consultas vía ajax/fetch.  
* `data-searchable`: Indica que los valores de esa columna serán comparados contra el valor ingresado por el usuario en el buscador de contenidos.
* `data-col`: En la consulta vía ajax/fetch, indica qué columna de los registros obtenidos de la base de datos será mapeado a esta columna de la tabla HTML.

Ejemplo:

```html
<table class='padatables' cellspacing="0">
    <thead>
      <tr>
        <th data-sort data-searcheable>Nombre</th>
        <th data-searcheable>Sinopsis</th>
        <th data-sort data-type="int">Año</th>
        <th>Género</th>
        <th data-searcheable>Director</th>
        <th data-sort data-type="float">Puntaje</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
</table>
```

**IMPORTANTE**   
Semánticamente, PadaTables espera que las celdas encabezado (`<th>`) estén dentro de una etiqueta `<thead>` y esperará renderizar el contenido en una etiqueta `<tbody>`

#

### ATRIBUTOS DE CONFIGURACIÓN EN COMUN

|Atributo|Descripción|Valor esperado|Default|
|-|-|-|-|
|`limit`|Cantidad de registros a mostrar por página|Number|10
|`prev_text`|Texto para el botón de página anterior|String|<<|
|`next_text`|Texto para el botón de página siguiente|String|>>|
|`search_minlength`|Cantidad mínima de caracteres para el buscador de contenidos|Number|3|

#

En el caso de la tabla HTML, hay una serie de atributos específicos.

### ATRIBUTOS PARA LA TABLA EN HTML
|Atributo|Descripción|Valor esperado|Default|
|-|-|-|-|
|`sort_column`|Número de columna para ordenar por defecto la tabla (empezando desde cero)|Number|0|
|`sort_type`|Tipo de dato de la columna a ordenar por defecto|`int`,`float`,`date`|`str`|


### METODOS AUXILIARES:
El objeto instanciado del PadaTables tiene una serie de métodos de configuración, entre los que se encuentran 

* `padatables.setEndpoint( uri )`  
Método que indica el PHP a ejecutar para las peticiones vía ajax.
* `padatables.setPaginator( selector )`   
Método que recibe el selector CSS del contendor que se usará para crear los links del paginador de contenidos.  
Si no es una lista desordenada, se creará una dentro del contenedor especificado.  
* `padatables.setSearch( selector )`   
Método que recibe el selector CSS del objeto que se usará como buscador de contenidos.  
Si el objeto indicado no es un Input de tipo text, se creará uno dentro del contenedor especificado.  
* `padatables.setPlaceholderMessage( str )`  
Método que recibe una cadena de texto que se mostrará como placeholder del input para el buscador.
* `padatables.setEmptyMessage( str )`  
Método que recibe una cadena de texto que se mostrará como mensaje de error cuando no haya resultados (por ejemplo en el buscador de contenidos).

Ejemplo completo:

**HTML**
```html
  <div id="filtros"></div>
  <table class='padatables' cellspacing="0">
    <thead>
      <tr>
        <th data-sort data-searcheable>Nombre</th>
        <th data-searcheable>Sinopsis</th>
        <th data-sort data-type="int">Año</th>
        <th>Género</th>
        <th data-searcheable>Director</th>
        <th data-sort data-type="float">Puntaje</th>
      </tr>
    </thead>
    <tbody>
      <!-- todos los contenidos de la tabla -->
    </tbody>
  </table>
  <div id="paginador"></div>
```

**JS**
```js
const padatables = new PadaTables( '.padatables', { limit: 2, sort_column: 0 } );
padatables.setPaginator( '#paginador' );
padatables.setSearch( '#filtros' );
padatables.setEmptyMessage( 'No hay coincidencias / filas' );
padatables.setPlaceholderMessage( 'Escribí algo y filtramos las filas' );
padatables.render( );
```

