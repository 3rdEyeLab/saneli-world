import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProduct() {
  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading text-3xl tracking-widest uppercase mb-8">Add Product</h1>
        <ProductForm />
      </div>
    </AdminShell>
  );
}
