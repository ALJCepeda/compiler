CREATE TABLE platform (
	name character varying(255) PRIMARY KEY,
	aceMode character varying(32) NOT NULL,
	extension character varying(16) NOT NULL
);

INSERT INTO platform ( name, extension, aceMode ) VALUES
	( 'PHP', 'php', 'php' ),
	( 'NodeJS', 'js', 'javascript' ),
	( 'Haskell', 'hs', 'haskell' ),
	( 'Pascal', 'pas', 'pascal'  );

CREATE TABLE execute (
	platform character varying(255),
	tag character varying(32),
	run text NOT NULL,
	compile text,
	FOREIGN KEY(platform, tag) REFERENCES version,
	PRIMARY KEY(platform, tag)
);

INSERT INTO execute ( platform, tag, run, compile) VALUES
	( 'PHP', 'latest', 'php {index}.{extension}', NULL ),
	( 'NodeJS', 'latest', 'node {index}.{extension}', NULL ),
	( 'Haskell', 'latest', './{compiled}.{extension}', 'ghc -o {compiled} {index}.{extension}' ),
	( 'Pascal', 'latest', './{compiled}.{extension}', 'fpc {index}.{extension}');

CREATE TABLE version (
	platform character varying(255) REFERENCES platform,
	tag character varying(32),
	enabled boolean not null default true,
	PRIMARY KEY(platform, tag)
);

INSERT INTO version ( tag, platform ) VALUES
	( '5.4', 'PHP' ), ( '5.5', 'PHP' ), ( '5.6', 'PHP' ), ( 'latest', 'PHP' ),
	( '0.12.7', 'NodeJS'), ( 'latest', 'NodeJS' ),
	( 'latest', 'Haskell' ), ( 'latest', 'Pascal' );

CREATE TABLE project (
    name character varying(32) PRIMARY KEY,
    platform character varying(255),
	tag character varying(32),
    created timestamp with time zone DEFAULT now(),
	demo boolean not null default false,
	FOREIGN KEY(platform, tag) REFERENCES version
);

INSERT INTO project ( name, platform, tag, demo ) VALUES
	( 'PHP', 'PHP', 'latest', true ),
	( 'NodeJS', 'NodeJS', 'latest', true ),
	( 'Haskell', 'Haskell', 'latest', true ),
	( 'Pascal', 'Pascal', 'latest', true );

CREATE TABLE save (
	project character varying(32) NOT NULL,
	tree text NOT NULL,
	list text NOT NULL
);

CREATE TABLE document (
	name character varying(32) NOT NULL,
	project character varying(32) REFERENCES project,
	extension character varying(16) NOT NULL,
	content text NOT NULL,
	created timestamp with time zone DEFAULT now(),
	PRIMARY KEY(name, project)
);

INSERT INTO document ( name, project, extension, content ) VALUES
	( 'index', 'PHP', 'php', '<?php\n\techo "Hello World!";' ),
	( 'index', 'NodeJS', 'js', 'console.log("Hello World!");' ),
	( 'index', 'Haskell', 'hs', 'main = putStrLn "Hello World!";' ),
	( 'index', 'Pascal', 'pas', 'program Hello;\nbegin\n\twriteln ("Hello World!");\nend.' );

CREATE TABLE mount (
	project character varying(32) REFERENCES project,
	host text NOT NULL,
	guest text NOT NULL
);

INSERT INTO mount ( project, host, guest ) VALUES
	( 'PHP', '{root}/resources/configs/php.ini', '/usr/local/etc/php/php.ini');


REVOKE CONNECT ON DATABASE eval FROM PUBLIC;

GRANT CONNECT
ON DATABASE eval
TO vagrant;

REVOKE ALL
ON ALL TABLES IN SCHEMA public
FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO vagrant;

ALTER DEFAULT PRIVILEGES
FOR USER vagrant
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vagrant;
