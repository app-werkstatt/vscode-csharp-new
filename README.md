# Create New C# Type (csharp-new)

Does what it says on the box: It enables you to create new C# types. Specifically it adds
a menu to create a new C# type file in a given folder.

## Features

Supported types:

-   class
-   record
-   struct
-   record struct
-   enum
-   enum with \[Flags\] attribute

Namespace resolution:

It reads the namespace from the project name or from a settings file.
Supports both nested and flat namespaces.

Generics in type name:

You can enter type names with generics, which are excluded from the file name.

## Known issues

Namespace reading from the &lt;RootNamespace&gt; csproj setting is not yet supported.

## Release Notes

### 0.2.1

-   Use correct C# brace placement rules

### 0.2.0

-   Add support for generics in type names
-   Show potential errors in type names

### 0.1.0

-   Initial release
