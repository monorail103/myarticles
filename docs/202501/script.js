document.addEventListener("DOMContentLoaded", function() {
    // 表の自動付番
    const tables = document.querySelectorAll("table");
    tables.forEach((table, index) => {
        const caption = table.querySelector("caption");
        if (caption) {
            caption.textContent = `表${index + 1}: ${caption.textContent.replace(/表\d+: /, '')}`;
        }
    });

    // 図の自動付番
    const figures = document.querySelectorAll("figure");
    figures.forEach((figure, index) => {
        const figcaption = figure.querySelector("figcaption");
        if (figcaption) {
            figcaption.textContent = `図${index + 1}: ${figcaption.textContent.replace(/図\d+: /, '')}`;
        }
    });

    // 目次の自動生成
    const tocList = document.getElementById('toc-list');
    const headers = document.querySelectorAll('main h2, main h3');

    let currentH2 = null;

    headers.forEach(header => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        const headerId = header.textContent.replace(/\s+/g, '-').toLowerCase();

        header.id = headerId;
        link.href = `#${headerId}`;
        link.textContent = header.textContent;

        listItem.appendChild(link);

        if (header.tagName.toLowerCase() === 'h2') {
            currentH2 = document.createElement('ul');
            listItem.appendChild(currentH2);
            tocList.appendChild(listItem);
        } else if (header.tagName.toLowerCase() === 'h3' && currentH2) {
            currentH2.appendChild(listItem);
        }
    });
});