<?php
$searchValue = $_POST['search'] ?? '';
$searchCols = isset( $_POST['search_cols'] ) ?
  json_decode( base64_decode( $_POST['search_cols'] ) )  :
  [];

$limit = $_POST['limit'] ?? 10;
$page = $_POST['page'] ?? 1;
$order = $_POST['order_by'] ?? "NOMBRE";
$way = $_POST['order_way'] == '1' ? "ASC" : "DESC";
$start = ($page - 1) * $limit;

$where_like = '';
$where_like_array = [];
$where_like_params = [];

if( count( $searchCols ) && !empty($searchValue) ):
  foreach( $searchCols as $columna ){
    $where_like_array[] = "$columna LIKE :token";
  }
  $where_like = 'WHERE ' . implode( " OR ", $where_like_array );
  $where_like_params[':token'] = "%$searchValue%";
endif;

$cnx = new PDO( 'mysql:host=localhost;dbname=twitch_padatables;charset=utf8mb4;port=3307', 'root', '' );
$cnx->setAttribute( PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC );

$query_qtty = "SELECT COUNT(*) AS TOTAL FROM peliculas $where_like";
$stmt_qtty = $cnx->prepare($query_qtty);
$stmt_qtty->execute( $where_like_params );
$resultados_qtty = $stmt_qtty->fetch( );

$query = "SELECT * FROM peliculas $where_like ORDER BY $order $way LIMIT $start, $limit";
$stmt = $cnx->prepare($query);
$stmt->execute( $where_like_params );
$resultados = $stmt->fetchAll( );
echo json_encode(['rows' => $resultados, 'total_rows' => $resultados_qtty['TOTAL'], 'page' => $page, 'q' => $query, 'p' => $where_like_params ]);