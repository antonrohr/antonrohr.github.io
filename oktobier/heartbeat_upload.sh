#!/bin/bash

CURRENT_IP=$(curl -s ifconfig.me);
OLD_IP=$(<addr);

if [ "$CURRENT_IP" == "$OLD_IP" ]; then
	exit 0;
fi

echo "$CURRENT_IP" > addr &&
echo "<!DOCTYPE html>
<!-- AUTOMATICALLY GENERATED FILE, DO NOT TOUCH -->
<html>
	<head>
		<title>Redirect</title>
		<meta http-equiv=\"refresh\" content=\"0; url=http://"$CURRENT_IP"/\" />
	</head>
	<body>
		Redirect <a href=\"http://"$CURRENT_IP"/\">here</a>
	</body>
</html>" > index.html &&
git add addr index.html &&
git commit -m "automated commit; updated addr and index.html" &&
git push