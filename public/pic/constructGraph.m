(* ::Package:: *)


Needs["DatabaseLink`"];
conn = OpenSQLConnection[JDBC["MySQL(Connector/J)", "localhost/sybildet"], "Username" -> "root", "Password" -> "luhaoPHP0522"];
communities = SQLExecute[conn, "Select id from community"];
Print["Length: " <> ToString[communities]];
For[k = 1, k <= Length[communities], k++,
	communityID = ToString[communities[[k]][[1]]];
	users = SQLExecute[conn, "Select userList, size from community where id = " <> communityID];
	size = users[[1]][[2]];
	users = StringSplit[users[[1]][[1]], {",", "L"}];
	Print["Size of Cluster " <> communityID <> ":\t" <> ToString[size] <> "\t" <> ToString[Length[users]]];
	edges = {};
	For[i = 1, i <= Length[users], i++, 
		neighbors = SQLExecute[conn, "Select coreNum, coreNeighbour from usernode where userid = " <> users[[i]]];
		If[ToExpression[neighbors[[1]][[1]]] > 0, 
			neighbors = StringSplit[neighbors[[1]][[2]], {",", "L"}];
			For[j = 1, j <= Length[neighbors], j++,
				If[MemberQ[users, neighbors[[j]]],
					pos = Position[users, neighbors[[j]]][[1]][[1]];
					If[i < pos, AppendTo[edges, i <-> pos]]; 
				];
			];
		];
	]; 

	g = Graph[edges];
	Export["./" <> communityID <> ".png", g];

];
	


