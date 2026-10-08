// Export dependencies are intentionally loaded only when a user requests an
// export. These packages are large and should not slow down normal navigation.
export async function loadXlsx() {
  const module = await import("xlsx");
  return module.default || module;
}

export async function loadPdf() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  return { jsPDF, autoTable };
}
