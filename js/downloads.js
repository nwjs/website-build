(function () {

    function ext(file) {
        switch (file) {
            case 'win-x64':
            case 'win-ia32':
            case 'win-arm64':
                return '.zip';
            case 'osx-x64':
            case 'osx-arm64':
            case 'osx-ia32':
                return '.zip';
            case 'linux-x64':
            case 'linux-ia32':
                return '.tar.gz';
        }
    }

    var file2name = {
        'win-ia32': 'Windows 32-bit',
        'win-x64': 'Windows 64-bit',
        'win-arm64': 'Windows ARM64',
        'osx-ia32': 'Mac OS X 32-bit',
        'osx-x64': 'Mac OS X 64-bit',
        'osx-arm64': 'Mac OS X ARM64',
        'linux-x64': 'Linux 64-bit',
        'linux-ia32': 'Linux 32-bit'
    };

    function name(file) {
        return file2name[file];
    }

    function findVersion(versions, v) {
        var verList = versions.versions;
        var idx = -1;
        verList.some(function (item, i) {
            if (item.version === v) {
                idx = i;
                return true;
            }
        });
        if (idx >= 0) {
            return verList[idx];
        } else {
            return false;
        }
    }

    var DownloadMatrix = React.createClass({
        displayName: 'DownloadMatrix',

        render: function () {
            var baseUrl = this.props.base;
            var version = this.props.version;
            var flavors = version.flavors;
            var widthStyle = { width: 100 / (flavors.length + 1) + '%' };
            var rows = version.files.map(function (file, rI) {
                var cols = flavors.filter(function (flavor) {
                    if (flavor === 'macappstore' || flavor === 'mas') {
                        if (!file.match(/osx/i)) {
                            return false;
                        }
                    }
                    return true;
                }).map(function (flavor, cI) {
                    var url = baseUrl + '/' + version.version + '/nwjs' + (flavor === 'normal' ? '' : '-' + flavor) + '-' + version.version + '-' + file + ext(file);
                    return React.createElement(
                        'td',
                        { key: cI, style: widthStyle },
                        React.createElement(
                            'a',
                            { href: url },
                            flavor.toUpperCase()
                        )
                    );
                });
                cols.unshift(React.createElement(
                    'th',
                    { key: -1, style: widthStyle },
                    name(file)
                ));

                return React.createElement(
                    'tr',
                    { key: rI },
                    cols
                );
            });
            return React.createElement(
                'table',
                null,
                React.createElement(
                    'tbody',
                    null,
                    rows
                )
            );
        }
    });

    var Downloads = React.createClass({
        displayName: 'Downloads',

        getInitialState: function () {
            return { version: 'stable' };
        },
        render: function () {
            var self = this;
            var versions = this.props.versions;
            var baseUrl = this.props.base;
            var ltsNotes = '(Windows XP / Vista and Mac OS X 10.6 ~ 10.8)';
            var versionList = [['stable', 'Stable'], ['latest', 'Latest']].filter(function (pair) {
                return !!versions[pair[0]];
            }).map(function (pair) {
                var use = pair[0];
                var text = pair[1];
                var idx = -1;
                versions.versions.some(function (val, i) {
                    if (val.version === versions[use]) {
                        idx = i;
                        return true;
                    }
                    return false;
                });
                var lines = [];
                lines.push(React.createElement(
                    'h3',
                    { key: 'version' },
                    text,
                    ' ',
                    versions[use]
                ));
                if (idx !== -1) {
                    var c = versions.versions[idx].components;
                    lines.push(React.createElement(
                        'div',
                        { key: 'components' },
                        'Chromium ',
                        c.chromium.split('.')[0],
                        ' + Node ',
                        c.node
                    ));
                }
                if (use === 'lts') {
                    lines.push(React.createElement(
                        'div',
                        { key: 'lts-notes' },
                        ltsNotes
                    ));
                }
                return React.createElement(
                    'a',
                    { key: use, title: use === 'lts' ? ltsNotes : '', href: '#', className: self.state.version === use ? 'selected' : '', onClick: self.toggleVersion.bind(self, use) },
                    lines
                );
            });
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'nav',
                    null,
                    versionList
                ),
                React.createElement(DownloadMatrix, { base: baseUrl, version: findVersion(versions, versions[this.state.version]) }),
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: baseUrl + '/' + versions[this.state.version] + '/' },
                            'Other downloads'
                        ),
                        ' for ',
                        versions[this.state.version]
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: baseUrl },
                            'Previous releases'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: baseUrl + '/live-build/' },
                            'Nightly builds'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: baseUrl + '/' + versions['lts'] },
                            'Legacy release'
                        ),
                        ' for Windows XP and Mac OS X 10.6 support. NOTE: Chromium and Node.js of LTS release stick to a fixed version. You won\'t get security updates for this release. Please use version only to build the binaries for those OS versions.'
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'https://github.com/LeonardLaszlo/nw.js-armv7-binaries' },
                            'ARM binary from community'
                        )
                    )
                )
            );
        },
        toggleVersion: function (version, e) {
            this.setState({ version: version });
            e.preventDefault();
        }
    });

    getVersionsJSON(function (err, versions) {
        if (err) {
            console.error(err);
            return;
        }

        var contentElem = document.getElementsByClassName('content')[0];
        var baseUrl = contentElem.getAttribute('data-base-url');

        ReactDOM.render(React.createElement(Downloads, { versions: versions, base: baseUrl }), contentElem);
    });
})();