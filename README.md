# var-replacer

A CLI tool to inject environment variables into IDM configurations allowing you to easily have different environments with the same config, as well as keeping secrets out of you repo by ignoring .env files. 

__WARNING__ <br>
Make sure that all the .env files have the same keys! If the .env files is missing a key, the key will be kept in the compiled configuration instead on the key value.

## Installation
Clone the repo to desired location<br>
Navigate to repo with a command line and install dependencies with 
```npm install ```<br>

From same location, link the package to your computer with
```npm link ```<br>

You can now run the package from anywhere with a command line.

#### Requirements: 
This app requires your computer to have Node.js installed.

## How to use
Replace any variables in the IDM config with @key@<br>
Currently these types are supported:<br>
- caconfigs
- datapools
- authprofiles
- transferconfigs
- users

The tool will replace any keys it finds with the matching key in the chosen .env file.

Example: 
```
users/admin.xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<user fullUsername="Administrator" password="@USER_ADMIN_PDW@" username="admin">
    <role instanceIds="" name="Administrator"/>
    <role instanceIds="" name="BaseRoleBootstrapAdmin"/>
</user>

test.env
USER_ADMIN_PDW="$2a$10$vcl6oBWYF.reukbxhx.CUeRfDNtVuTsOcVuUIvQIR2GvtbOjA6yCS"

```

After running `var-replace test` from the configuration location a new folder named `__compiled_test` will be created<br>
The configuration will be copied to that folder, but all keys will be replaced with the values from test.env
So the users/admin.xml will now look like:
```
__compiled_test/users/admin.xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<user fullUsername="Administrator" password="$2a$10$vcl6oBWYF.reukbxhx.CUeRfDNtVuTsOcVuUIvQIR2GvtbOjA6yCS" username="admin">
    <role instanceIds="" name="Administrator"/>
    <role instanceIds="" name="BaseRoleBootstrapAdmin"/>
</user>

```

You can now pack the __compiled_test folder to a zip and upload the config to you test environment.

You can have as many environments as you like, just create a new .env file with the environment name (e.g. prod.env) and run `var-replacer prod` in the command line. __compiled_prod folder will be created.


Any parts of the configuration can be replaced as long as they are one of the supported types listed above.
This is an example with a transferconfig where the filepath is being replaced (EXTERNAL_PATH).

```
transferconfig/ExportCard.xml

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<transferConfig type="CSV" name="ExportCard">
    <mapping externalField="cardnumber" internalField="${Cards.cardNumber}"/>
    <mapping externalField="id" internalField="nexus_${Cards.personIdent}"/>
    <mapping externalField="format" internalField="Mifare CSN"/>
    <property name="APPEND_TO_FILE" value="true"/>
    <property name="EXTERNAL_DATE" value="dd.MM.yyyy"/>
    <property name="EXTERNAL_DATE_TIME" value="dd.MM.yyyy HH:mm:ss"/>
    <property name="EXTERNAL_FILE" value="CardExport.csv"/>
    <property name="EXTERNAL_FILE_ENCODING" value="UTF-8"/>
    <property name="EXTERNAL_PATH" value="@TRANFSER_CARDS_PATH@"/>
    <property name="EXTERNAL_TIME" value="HH:mm:ss"/>
    <property name="EXTERNAL_VALUE_SEPARATOR" value=";"/>
    <property name="WRITE_HEADER_ROW" value="true"/>
</transferConfig>


test.env
...
TRANFSER_CARDS_PATH="/export/cards/"
...
```