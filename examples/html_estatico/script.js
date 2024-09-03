const pt = new PadaTables( '.padatables', { limit: 3, sort_column: 0 } );
pt.setPaginator( '#paginador' );
pt.setSearch( '#filtros' );
pt.setEmptyMessage( 'No hay coincidencias / filas' );
pt.setPlaceholderMessage( 'Escribí algo y filtramos las filas' );
pt.render( );