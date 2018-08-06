export default ($mdDialog, errors) => {
  let html = '<br/>Please fix the following errors: <br/><br/><ul>';
  errors.forEach(e => {
    html += `<li>${e}</li>`;
  });
  html += '</ul';

  $mdDialog.show(
    $mdDialog
      .alert()
      .title('Invalid Project Configuration')
      .htmlContent(html)
      .ok('Got it!'),
  );
};
