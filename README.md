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

It reads the correct namespace from the project name or from a settings file.
Supports both nested and flat namespaces.

## Known issues

Namespace reading from the &lt;RootNamespace&gt; csproj setting is not yet supported.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release.
