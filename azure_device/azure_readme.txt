
sql database access:
labo-iot-admin
Pa$$w0rd

https://github.com/tediousjs/tedious/issues/35


Create Table test
(
	[Id] [int] identity(1,1) Not null,
	[messageId] [varchar] (3) null,
	[deviceId] [nvarchar] (200) null,
	[temperature] [nvarchar] (200) null,
	[time] [datetime] null
):

Create Table ROOM
(
	id INT NOT NULL,
	name varchar(10) null,
	PRIMARY KEY (id)
);

INSERT INTO ROOM (id, name) VALUES (32753, 'salon');
INSERT INTO ROOM (id, name) VALUES (57473, 'cuisine');


Create Table RADIATOR_VALUES
(
	id int identity(1,1) Not null,
	time datetime null,
	radiator_number int null,
	value int null,
	room_id INT references ROOM(id),	
);

Create Table BLIND_VALUES
(
	id int identity(1,1) Not null,
	time datetime null,
	blind_number int null,
	value int null,
	room_id INT references ROOM(id),	
);



Create Table ROOM_OCCUPATION
(
	id int identity(1,1) Not null,
	is_occupied BIT,
	time datetime null,
	id_room INT references ROOM(id)
);

Create Table ROOM_SENSOR
(
	id int identity(1,1) Not null,
	time datetime2 null,
	temperature int null,
	luminance int null,
	humidity int null,
	sensor int null,
	id_room INT references ROOM(id)
)

