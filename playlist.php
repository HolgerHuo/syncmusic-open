<?php
// 你的 API 服务器地址
define("API_URL", "https://cdn.zerodream.net/netease");
if (isset($_GET['s']) && !empty($_GET['s'])) {
	$id = urlencode($_GET['s']);
	$rawdata = @file_get_contents(API_URL . "/api.php?types=playlist&id={$id}&count=10&pages=1");
    $data = json_decode($rawdata, true);
    $data = $data['playlist']['tracks'];
	if (!$data || empty($data)) {
		if (isset($_GET['debug'])) {
			exit($rawdata);
		}
		exit("<center><p>未找到结果</p></center>");
	}
} else {
	exit("<center><p>请在输入框中输入歌单id</p></center>");
}
function getArtists($data)
{
    $data = $data['ar'];
	if (count($data) > 1) {
		$artists = "";
		foreach ($data as $artist) {
            $artists .= $artist['name'] . ",";
		}
		$artists = $artists == "" ? "未知歌手" : mb_substr($artists, 0, mb_strlen($artists) - 1);
	} else {
		$artists = $data[0]['name'];
	}
    return $artists;
}
function getAlbums($data)
{
	return $data['al']['name'];
}
?>
<html>

<head>
	<meta name="theme-color" content="#009688" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=11">
	<title>669点歌台 | 歌单</title>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/materialize-css@1.0.0/dist/css/materialize.min.css">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
	<style>
		.table tr {
			font-size: 14px;
		}

		.table .result:hover {
			cursor: pointer;
			color: #009688 !important;
		}

		.table tr th,
		.table tr td {
			white-space: nowrap;
		}
	</style>
</head>

<body style="display: none; text-align: center">
	<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js"></script>
	<button onclick="window.parent.$(window.parent.playlist_search).fadeOut();" class="btn btn-primary">退出</button>
	<table class="table" id="musicList">
		<tr>
			<th>歌名</th>
			<th>歌手</th>
			<th>专辑</th>
		</tr>
		<?php
		foreach ($data as $music) {
			$info = $music['id'] . ",\"" . $music['name'] . "\"";
			echo "<tr class='result' onclick='select({$info})'>
				<td>{$music['name']}</td>
				<td>" . getArtists($music) . "</td>
				<td>" . getAlbums($music) . "</td>
			</tr>";
		}
		?>
	</table>
</body>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/materialize-css@1.0.0/dist/js/materialize.min.js"></script>
<script type="text/javascript">
	function select(data,name) {
		try {
			window.parent.msginput.value = "点歌 " + data;
			window.parent.sendmsg();
			window.parent.Snackbar.show({
				text: '点歌 ' + name + ' 成功',
				backgroundColor: "#49b1f5",
				duration: 2000,
				pos: "bottom-right",
				actionText: '返回点歌台',
				actionTextColor: '#fff',
				onActionClick: function (e) {
					$(playlist_search).fadeOut();
					//$(msginput).focus();
				},
			})
		} catch (e) {
			// No
		}
	}
	window.onload = function() {
		$(document.body).fadeIn();
	}
</script>

</html>