(function () {

    var matched = navigator.platform.match(/Win|Mac|Linux/i);
    var os = matched ? matched[0].toLowerCase() : 'linux';
    if (os === 'mac') {
        os = 'osx';
    }
    matched = navigator.userAgent.match(/x86_64|Win64|WOW64/i);
    var arch = matched ? 'x64' : 'ia32';
    if (os === 'osx') arch = 'arm64';

    var os2name = {
        'win': 'Windows',
        'osx': 'Mac OS X',
        'linux': 'Linux'
    };

    var os2ext = {
        'win': '.zip',
        'osx': '.zip',
        'linux': '.tar.gz'
    };

    function isMas(flavor) {
        return flavor === 'mas' || flavor === 'macappstore';
    }

    var DownloadButton = React.createClass({
        displayName: 'DownloadButton',

        render: function () {
            var props = this.props;
            var url = props.base + '/' + props.version + '/nwjs' + (props.flavor === 'normal' ? '' : '-' + props.flavor) + '-' + props.version + '-' + props.os + '-' + props.arch + os2ext[props.os];

            return React.createElement(
                'div',
                { className: props.arch === 'ia32' ? 'd32bit' : 'd64bit' },
                React.createElement(
                    'a',
                    { href: url },
                    props.version,
                    React.createElement('br', null),
                    React.createElement(
                        'strong',
                        null,
                        props.flavor.toUpperCase()
                    )
                )
            );
        }
    });

    var DownloadArea = React.createClass({
        displayName: 'DownloadArea',

        render: function () {
            var props = this.props;
            var btnList = this.props.flavors.filter(function (flavor) {
                return (!isMas(flavor) || props.os === 'osx') && props.files.indexOf(props.os + '-' + props.arch) >= 0;
            }).map(function (flavor, i) {
                return React.createElement(DownloadButton, { key: i, os: props.os, base: props.base, arch: props.arch, version: props.version, flavor: flavor });
            });
            var use = props.use.charAt(0).toUpperCase() + props.use.substring(1);

            // to be removed
            // workaround broken release notes url for specific version
            var version = props.version;
            if (version === 'v0.17.0') version = '0.17.0';

            return React.createElement(
                'div',
                { className: 'os' },
                React.createElement(
                    'h1',
                    null,
                    'Download ',
                    React.createElement(
                        'em',
                        null,
                        use
                    ),
                    ' for ',
                    os2name[props.os],
                    ' (',
                    props.arch,
                    ')'
                ),
                React.createElement(
                    'div',
                    null,
                    'Chromium ',
                    props.components.chromium.split('.')[0],
                    ' + Node ',
                    props.components.node
                ),
                React.createElement(
                    'div',
                    { className: 'dlbtnlist' },
                    btnList
                ),
                React.createElement(
                    'a',
                    { className: 'release-notes', href: '/blog/' + version + '/' },
                    'Release Notes'
                )
            );
        }
    });

    function render(downAreaElem, versions) {
        var baseUrl = downAreaElem.getAttribute('data-base-url');
        var use = downAreaElem.getAttribute('data-use');
        var version = versions[use];
        var idx = -1;

        versions.versions.some(function (v, i) {
            if (v.version === version) {
                idx = i;
                return true;
            }
            return false;
        });

        if (idx >= 0) {
            var flavors = versions.versions[idx].flavors;
            ReactDOM.render(React.createElement(DownloadArea, { use: use, files: versions.versions[idx].files, flavors: flavors, version: version, os: os, arch: arch, base: baseUrl, components: versions.versions[idx].components }), downAreaElem);
        }
    }

    getVersionsJSON(function (err, versions) {
        if (err) {
            console.error(err);
            return;
        }
        var downAreaElems = document.getElementsByClassName('download-area');

        [].slice.call(downAreaElems, 0).forEach(function (downAreaElem) {
            render(downAreaElem, versions);
        });
    });
})();