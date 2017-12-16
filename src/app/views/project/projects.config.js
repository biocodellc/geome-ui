export default function ($uibTooltipProvider) {
  "ngInject";

  $uibTooltipProvider.setTriggers({ 'none': 'outsideClick' });
}
