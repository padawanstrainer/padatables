class PadaTables{
  Table = null;
  Body = null;
  ColumnsQtty = 0;
  Paginator = null; //container del paginador
  PaginatorTotal = 0; //cantidad de registros para sacar la cantidad de paginas
  Search = null; //container del search/filters
  SearchInput = null; //input type text para filtrar 
  SearchValue = '';
  RowsOriginal = []; //esto será el json, db o htmlcollection SIN pasar por el paginador, ni buscador, ni criterio de ordenamiento

  Endpoint = null;
  Columns = [];

  TotalPages = 0;
  Rows = [];
  SearchableCols = [];

  Messages = {
    empty: 'No se han encontrado registros...',
    placeholder: 'Filtrar resultados'
  }

  Config = {
    sort_column: 0,
    sort_type: 'float',
    sort_way: 1,

    limit: 10,
    page: 1,
    prev_text: '<<',
    next_text: '>>',

    search_minlength: 3
  }

  constructor( tableSelector = '.padatables', Config = {} ){
    this.Config = { ...this.Config, ...Config }; 
    //plan b hubiese sido un Object.assign( this.Config, Config );
    this.init( tableSelector );
    this.scanDataAttrs( );
  }

  scanRows( ){
    this.RowsOriginal = this.Body.querySelectorAll( 'tr' );
  }

  scanDataAttrs( ){
    const ths = document.querySelectorAll('thead th');
    this.ColumnsQtty = Array.from(ths).length;
    Array.from(ths).forEach( (th, idx) => {
      if( th.dataset.sort != undefined ){
        if( idx == this.Config.sort_column ){
          th.classList.add( this.Config.sort_way == 1 ? 'asc' : 'desc' );
        }

        th.addEventListener( 'click', e => {
          if( this.Config.sort_column == idx ){
            this.Config.sort_way = this.Config.sort_way == 1 ? 0 : 1;
          }else{
            this.Config.sort_way = 1; //por default es asc
          }
          this.Config.sort_column = idx;
          this.Config.sort_type = th.dataset.type ?? 'str';
          this.Config.page = 1;

          const prev_th = document.querySelector('th.asc, th.desc');
          if( prev_th ){ prev_th.classList.remove( 'asc', 'desc' ); }
          th.classList.add( this.Config.sort_way == 1 ? 'asc' : 'desc' );

          this.Endpoint == null ? this.updateTable( ) : this.fetchRows( );
        } );
      }

      if( th.dataset.searcheable != undefined ){
        this.SearchableCols.push( idx );
      }

      if( th.dataset.col != undefined ){
        this.Columns[idx] = th.dataset.col;
      }
    } );
  }

  paginate( ){
    const rowsFrom = ( this.Config.page - 1 ) * this.Config.limit;
    const rowsTo = rowsFrom + this.Config.limit;
    this.Rows = this.Rows.slice( rowsFrom, rowsTo ); 
  }

  getPaginatorSibling( which ){
    const actual = document.querySelector( '.padatables__paginator__active' );
    if( ! actual ) return;

    const target = which == 'next' ?
                    'nextElementSibling' :
                    'previousElementSibling';

    return actual.parentElement[target]?.querySelector('a:not(.next_prev_link)');
  }

  addPaginatorLink( text, callback = null, className = null ){
    const li = document.createElement('li');
    const a = document.createElement('a');
    if( className ) a.classList.add( className );
    if( callback ) a.addEventListener( 'click', callback );

    a.href = 'javascript:void(0)';
    a.innerHTML = text;
    li.appendChild( a );
    this.Paginator.appendChild( li );
  }

  prevNextCallback( which ){
    const prev = this.Config.page + ( which == 'prev' ? -1 : 1 );
    const a = this.getPaginatorSibling( which );

    if( ! a ) return;
    this.setPage( prev, a );
  }

  createPageButtons( ){
    this.Paginator.innerHTML = '';
    this.TotalPages = Math.ceil( this.PaginatorTotal / this.Config.limit );

    if( ! this.Paginator || this.TotalPages < 2 ) return;
    
    //BOTON DE ANTERIOR
    this.addPaginatorLink(
      this.Config.prev_text,
      e => { this.prevNextCallback( 'prev' ); },
      'next_prev_link'
    );

    //CADA ITEM DEL PAGINADOR
    for( let i = 1; i <= this.TotalPages; i++ ){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href= 'javascript:void(0)';
      a.innerHTML = i;
      a.addEventListener( 'click', e => {
        this.setPage( i , a );
      } );

      if( i == this.Config.page ){
        a.classList.add( 'padatables__paginator__active' );
      }

      li.appendChild( a );
      this.Paginator.appendChild( li );
    }

    //BOTON SIGUIENTE
    this.addPaginatorLink(
      this.Config.next_text,
      e => { this.prevNextCallback( 'next' ); },
      'next_prev_link'
    );
  }

  showRows( ){
    this.Body.innerHTML = '';
    if( Array.from( this.Rows ).length == 0 ){
      this.Body.innerHTML = `<tr><td class='padatables__empty' colspan='${this.ColumnsQtty}'>${this.Messages.empty}</td></tr>`;
    } 

    Array.from( this.Rows ).forEach(row => {
      this.Body.appendChild(row);
    });
  }

  sortRowsCallback( col, type ){
    return function( fila1, fila2 ){
      let v1 = fila1.children[col].innerHTML;
      let v2 = fila2.children[col].innerHTML;

      if( type.toLowerCase() == 'int' ){
        v1 = parseInt( v1, 10 );
        v2 = parseInt( v2, 10 );
      }

      if( type.toLowerCase() == 'float' ){
        v1 = parseFloat( v1, 10 );
        v2 = parseFloat( v2, 10 );
      }

      if( type.toLowerCase() == 'date' ){
        v1 = new Date( v1 ).getTime( );
        v2 = new Date( v2 ).getTime( );
      }

      if( v1 < v2 ) return -1;
      if( v2 > v1 ) return 1;
      return 0;
    }
  }

  sortRows( ){
    this.Rows = [...this.RowsOriginal].sort(
      this.sortRowsCallback( this.Config.sort_column, this.Config.sort_type )
    );

    if( this.Config.sort_way != 1 ){
      this.Rows.reverse( );
    }
  }

  setPage( num, a ){
    if( num > this.TotalPages ) num = this.TotalPages;
    if( num < 1 ) num = 1;

    document.querySelector( '.padatables__paginator__active' )?.
    classList.remove( 'padatables__paginator__active' );

    a.classList.add( 'padatables__paginator__active' );

    this.Config.page = num;
    this.Endpoint == null ? this.updateTable() : this.fetchRows( );
  }

  setPaginator( selector ){
    const element = document.querySelector( selector );
    if( ! element ) throw new Error(`El paginador con el selector ${selector} no existe`);

    if( /^ul$/i.test( element.nodeName ) ){
      this.Paginator = element;
    }else{
      this.Paginator = document.createElement('ul');
      element.appendChild( this.Paginator );
    }

    this.Paginator.classList.add('padatables__paginator');
  }

  filterRows( ){
    const er = new RegExp( this.SearchValue, 'i' );
    
    this.Rows = Array.from(this.Rows).filter( r => {
      let existe = false;
      for( let col of this.SearchableCols ){
        if( er.test( r.children[col].innerHTML ) ){
          existe = true;
        }
      }
      return existe;
    });
    this.PaginatorTotal = this.Rows.length;
  }

  getFilterValue( ){
    this.SearchValue = '';
    if( this.SearchInput ){
      const value = this.SearchInput.value.trim( );
      if( value.length >= this.Config.search_minlength ){
        //si llegué acá, pasé mi validación del mínimo...
        this.Config.page = 1;
        this.SearchValue = value;
      }
    }
    this.Endpoint == null ? this.updateTable() : this.fetchRows( );
  }

  setSearch( selector ){
    this.Search = document.querySelector( selector );
    if( this.Search && this.SearchableCols.length > 0 ){
      this.SearchInput = document.createElement( 'input', { type: 'search' } );
      this.SearchInput.classList.add('padatables__searchInput');
      this.SearchInput.placeholder = this.Messages.placeholder;
      this.SearchInput.addEventListener( 'input', e => { this.getFilterValue() } );
      this.Search.appendChild( this.SearchInput );
    }
  }

  setEmptyMessage( str ){
    this.Messages.empty = str;
  }

  setPlaceholderMessage( str ){
    this.Messages.placeholder = str;
    if( this.SearchInput ) this.SearchInput.placeholder = str;
  }

  init( tableSelector ){
    this.Table = document.querySelector( tableSelector );
    if( ! this.Table ){
      throw new Error( `Eh wacho, no existe un elemento con el selector ${tableSelector}` );
    }

    this.Body = this.Table.querySelector( 'tbody' );
    if( ! this.Body ){
      throw new Error( `Eh wacho, no existe un elemento tbody en la tabla` );
    }
  }

  updateTable( ){
    this.sortRows( );
    this.filterRows( );
    this.paginate( );
    this.createPageButtons( );
    this.showRows( );
  }

  /* agregados del ajax */
  setEndpoint( url ){
    this.Endpoint = url;
  }

  fetchRows( ){
    const FD = new FormData( );
    const searchCols = btoa( JSON.stringify( this.SearchableCols.map( idx => this.Columns[idx] ) ) );

    FD.append( 'search', this.SearchValue );
    FD.append( 'search_cols', searchCols );
    FD.append( 'order_by', this.Columns[ this.Config.sort_column ] );
    FD.append( 'order_way', this.Config.sort_way );
    FD.append( 'page', this.Config.page );
    FD.append( 'limit', this.Config.limit );
    fetch( this.Endpoint, { method: 'POST', body: FD } )
    .then( r => r.json( ) )
    .then( json_peliculas => {
      this.Body.innerHTML = ''; //borro las filas

      this.PaginatorTotal = json_peliculas.total_rows;

      json_peliculas.rows.forEach( pelicula => {
        const tr = document.createElement('tr');

        this.Columns.forEach( c => {
          const td = document.createElement('td');
          td.innerHTML = pelicula[c];
          tr.appendChild( td );
        } );

        this.Body.appendChild( tr );
      } );
    } )
    .finally( () => {
      this.createPageButtons( );
    }) ;
  }

  render( ){
    if( this.Endpoint == null ){
      //buscar las filas desde el html
      this.scanRows( ); 
      this.updateTable( );
    }
    if( this.Endpoint != null ){
      //query contra el sql
      this.fetchRows( );
    }
  }
}