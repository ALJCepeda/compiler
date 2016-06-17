CREATE TABLE platform (
	name character varying(255) PRIMARY KEY,
	extension character varying(16) NOT NULL,
	run text NOT NULL,
	compile text
);

INSERT INTO platform ( name, extension, run, compile ) VALUES
	( 'PHP', 'php', 'php {index}.{extension}', NULL ),
	( 'NodeJS', 'js', 'node {index}.{extension}', NULL ),
	( 'Haskell', 'hs', './{compiled}.{extension}', 'ghc -o {compiled} {index}.{extension}' ),
	( 'Pascal', 'pas', './{compiled}.{extension}', 'fpc {index}.{extension}' );

CREATE TABLE version (
	platform character varying(255) REFERENCES platform,
	tag character varying(32),
	PRIMARY KEY(platform, tag)
);

INSERT INTO version ( tag, platform ) VALUES
	( '5.4', 'PHP' ), ( '5.5', 'PHP' ), ( '5.6', 'PHP' ), ( 'latest', 'PHP' )
	( '0.12.7', 'NodeJS'), ( 'latest', 'NodeJS' )
	( '7.10.2', 'Haskell'), ( 'latest', 'Haskell' )
	( '2.6.4', 'Pascal'), ( 'latest', 'Pascal' );

CREATE TABLE project (
    name character varying(32) PRIMARY KEY,
    platform character varying(255),
	tag character varying(32),
    created timestamp with time zone DEFAULT now(),
	FOREIGN KEY(platform, tag) REFERENCES version
);

INSERT INTO project ( name, platform, tag ) VALUES
	( 'PHP', 'PHP', 'latest' ),
	( 'NodeJS', 'NodeJS', 'latest' ),
	( 'Haskell', 'Haskell', 'latest' ),
	( 'Pascal', 'Pascal', 'latest' );

CREATE TABLE document (
	name character varying(32) NOT NULL,
	project character varying(32) REFERENCES project,
	extension character varying(16) NOT NULL,
	content text NOT NULL,
	created timestamp with time zone DEFAULT now(),
	PRIMARY KEY(name, project)
);

INSERT INTO document ( name, project, extension, content ) VALUES
	( 'index', 'PHP', 'php', '<?php\n\techo \"Hello World!\";' ),
	( 'index', 'NodeJS', 'js', 'console.log(\"Hello World!\");' ),
	( 'index', 'Haskell', 'hs', 'main = putStrLn \"Hello World!\";' ),
	( 'index', 'Pascal', 'pas', 'program Hello;\nbegin\n\twriteln (\"Hello World!\");\nend.' );

CREATE TABLE mount (
	project character varying(32) REFERENCES project,
	host text NOT NULL,
	guest text NOT NULL
);

INSERT INTO mount ( project, host, guest ) VALUES
	( 'PHP', '{root}/resources/configs/php.ini', '/usr/local/etc/php/php.ini');
