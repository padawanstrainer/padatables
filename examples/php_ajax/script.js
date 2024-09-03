const pt = new PadaTables( '.padatables', { limit: 2, sort_column: 0 } );
pt.setEndpoint( './php/peliculas.php' );
pt.setPaginator( '#paginador' );
pt.setSearch( '#filtros' );
pt.setEmptyMessage( 'No hay coincidencias / filas' );
pt.setPlaceholderMessage( 'Escribí algo y filtramos las filas' );
pt.render( );